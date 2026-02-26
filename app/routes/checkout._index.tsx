import { useState, useEffect } from "react";
import {
  useLoaderData,
  useOutletContext,
  useActionData,
  useNavigation,
  useRouteError,
  isRouteErrorResponse,
  redirect,
  data,
  Link,
  useFetchers,
  useNavigate,
} from "react-router";
import type { Route } from "./+types/checkout._index";
import type { OutletContext } from "~/types";
import { CurrencyCode, SortOrder } from "~/generated/graphql";
import {
  getAvailableCountries,
  getEligibleShippingMethods,
  getEligiblePaymentMethods,
  addPaymentToOrder,
  transitionOrderToState,
  getNextOrderStates,
} from "~/providers/checkout/checkout";
import { getOrderByCode, getActiveOrder } from "~/providers/orders/order";
import { getSession, commitSession } from "~/sessions";
import {
  getActiveCustomerAddresses,
  getActiveCustomerOrderList,
} from "~/providers/customer/customer";
import {
  CheckoutProvider,
  useCheckout,
} from "~/components/checkout/CheckoutProvider";
import { ContactStep } from "~/components/checkout/steps/ContactStep";
import { ShippingAddressStep } from "~/components/checkout/steps/ShippingAddressStep";
import { DeliveryStep } from "~/components/checkout/steps/DeliveryStep";
import { PaymentStep } from "~/components/checkout/steps/PaymentStep";
import { OrderSummary } from "~/components/checkout/OrderSummary";
import { PaymentInstructions } from "~/components/checkout/midtrans/PaymentInstructions";
import type { MidtransPaymentData } from "~/components/checkout/midtrans/types";

import { CheckCircleIcon } from "@heroicons/react/24/solid";

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl =
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const opts = { request, apiUrl };
  const activeOrder = await getActiveOrder(opts);

  // FIX: If activeOrder is null, it might be because the order was just placed/authorized
  // and is no longer "active". We should check if there's a recent order for this customer
  // or session before redirecting to home.
  if (!activeOrder || activeOrder.lines.length === 0) {
    // Try to find the most recent order for the logged-in customer
    try {
      const orderList = await getActiveCustomerOrderList(
        {
          take: 1,
          sort: { updatedAt: SortOrder.Desc },
        },
        opts,
      );

      const latestOrder = orderList?.activeCustomer?.orders?.items?.[0];
      if (latestOrder && latestOrder.orderPlacedAt) {
        const now = new Date();
        // The activeCustomerOrderList query does not return updatedAt, so we use orderPlacedAt
        const orderTime = new Date(latestOrder.orderPlacedAt);
        const diffMinutes = (now.getTime() - orderTime.getTime()) / 1000 / 60;

        // If updated within last 10 minutes and in a valid post-checkout state
        const validStates = [
          "PaymentAuthorized",
          "PaymentSettled",
          "PartiallySettled",
          "ArrangingPayment",
        ];
        if (diffMinutes < 10 && validStates.includes(latestOrder.state)) {
          return redirect(`/checkout/confirmation/${latestOrder.code}`);
        }
      }
    } catch (e) {
      console.error("Error checking recent orders:", e);
    }

    // If we still can't find an order, we don't strictly redirect to Home if we are in a transition.
    // However, if the user directly navigates here with empty cart, they usually expect a redirect or empty state.
    // We will return activeOrder as null and handle it in the UI to avoid the jarring redirect loop.
    // return redirect('/');
  }

  // If order is not active but has been placed (e.g. ArrangingPayment or beyond),
  // we should let it through if we are currently in the checkout flow,
  // or redirect to confirmation if it's already completed.
  if (activeOrder && !activeOrder.active) {
    const completedStates = [
      "PaymentAuthorized",
      "PaymentSettled",
      "PartiallySettled",
    ];
    if (completedStates.includes(activeOrder.state)) {
      return redirect(`/checkout/confirmation/${activeOrder.code}`);
    }
    // If it's in another state (like Shipped), redirect to home or history
    if (
      activeOrder.state !== "ArrangingPayment" &&
      activeOrder.state !== "AddingItems"
    ) {
      return redirect("/");
    }
  }

  // Transition to ArrangingPayment if shipping is set but state is still AddingItems
  // This is required to reveal eligible payment methods in Vendure
  let currentOrder = activeOrder;
  if (
    currentOrder &&
    currentOrder.state === "AddingItems" &&
    (currentOrder.shippingLines?.length ?? 0) > 0
  ) {
    await transitionOrderToState("ArrangingPayment", opts);
    currentOrder = await getActiveOrder(opts);
  }

  const [
    eligibleShippingMethodsData,
    eligiblePaymentMethodsData,
    availableCountriesData,
    addressesData,
  ] = await Promise.all([
    getEligibleShippingMethods(opts),
    getEligiblePaymentMethods(opts),
    getAvailableCountries(opts),
    getActiveCustomerAddresses(opts),
  ]);

  const availableCountries = availableCountriesData.availableCountries;
  const eligibleShippingMethods =
    eligibleShippingMethodsData.eligibleShippingMethods;
  let eligiblePaymentMethods =
    eligiblePaymentMethodsData.eligiblePaymentMethods;

  // One more check for payment methods if they are empty
  if (
    currentOrder &&
    currentOrder.state === "ArrangingPayment" &&
    eligiblePaymentMethods.length === 0
  ) {
    const refresh = await getEligiblePaymentMethods(opts);
    eligiblePaymentMethods = refresh.eligiblePaymentMethods;
  }

  const addresses = addressesData?.activeCustomer?.addresses ?? [];
  const session = await getSession(request.headers.get("Cookie"));
  const error = session.get("activeOrderError");

  const headers = new Headers();
  if (error) {
    headers.append("Set-Cookie", await commitSession(session));
  }

  return data(
    {
      activeOrder: currentOrder,
      availableCountries,
      eligibleShippingMethods,
      eligiblePaymentMethods,
      addresses,
      activeCustomer: addressesData?.activeCustomer,
      error,
    },
    { headers },
  );
}

export const action = async ({ request }: Route.ActionArgs) => {
  const body = await request.formData();
  const action = body.get("action");

  if (action === "completeOrder") {
    const paymentMethodCode = body.get("paymentMethodCode");
    const midtransMetadata = body.get("midtransMetadata");

    if (typeof paymentMethodCode === "string") {
      const orderToCheck = await getActiveOrder({ request });
      if (!orderToCheck) {
        return data({ error: "No active order found" }, { status: 400 });
      }

      if (!orderToCheck.customer) {
        return data(
          { error: "Customer information is missing" },
          { status: 400 },
        );
      }
      if (!orderToCheck.shippingAddress?.streetLine1) {
        return data({ error: "Shipping address is missing" }, { status: 400 });
      }
      if (!orderToCheck.shippingLines?.length) {
        return data({ error: "Shipping method Not selected" }, { status: 400 });
      }

      if (orderToCheck.state === "AddingItems") {
        const { nextOrderStates } = await getNextOrderStates({ request });
        if (nextOrderStates.includes("ArrangingPayment")) {
          const transitionResult = await transitionOrderToState(
            "ArrangingPayment",
            { request },
          );
          if (
            (transitionResult.transitionOrderToState as any)?.__typename !==
            "Order"
          ) {
            return data(
              {
                error:
                  (transitionResult.transitionOrderToState as any)?.message ||
                  "Failed to transition to ArrangingPayment",
              },
              { status: 400 },
            );
          }
        }
      }

      let metadata: Record<string, any> = {};
      if (midtransMetadata && typeof midtransMetadata === "string") {
        try {
          metadata = { ...metadata, ...JSON.parse(midtransMetadata) };
        } catch (e) {
          // Ignore parse errors
        }
      }

      const result = await addPaymentToOrder(
        { method: paymentMethodCode, metadata },
        { request },
      );

      if (result.addPaymentToOrder.__typename === "Order") {
        const order = result.addPaymentToOrder;

        // Forward Set-Cookie from addPaymentToOrder so the browser keeps
        // the updated auth token. Without this, the confirmation page loader
        // runs with the old token → Vendure can't find the order (guest race condition).
        const redirectHeaders = new Headers();
        const resultHeaders = (result as any)._headers as Headers | undefined;
        const setCookie = resultHeaders?.get("set-cookie");
        console.log(
          "[checkout action] addPaymentToOrder _headers keys:",
          resultHeaders ? [...resultHeaders.keys()] : "NO HEADERS",
        );
        console.log(
          "[checkout action] set-cookie from addPaymentToOrder:",
          setCookie ? "PRESENT" : "ABSENT",
        );
        if (setCookie) {
          redirectHeaders.set("Set-Cookie", setCookie);
        }

        // Also log all response headers for full diagnosis
        resultHeaders?.forEach((v, k) => {
          console.log(
            `[checkout action] response header: ${k} = ${k.toLowerCase().includes("cookie") ? "[REDACTED]" : v}`,
          );
        });

        console.log(
          "[checkout action] redirecting to confirmation, order state:",
          order.state,
          "code:",
          order.code,
        );
        return redirect(`/checkout/confirmation/${order.code}`, {
          headers: redirectHeaders,
        });
      } else {
        return data(
          {
            error:
              (result.addPaymentToOrder as any)?.message || "Payment failed",
          },
          { status: 400 },
        );
      }
    }
  }
  return data({ success: true });
};

function CheckoutContent() {
  const { error } = useLoaderData<typeof loader>();
  const { applyCoupon, removeCoupon } = useOutletContext<OutletContext>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const {
    activeOrder,
    activeOrderFetcher,
    paymentData,
    setPaymentData,
    activeCustomer,
  } = useCheckout();

  const [orderCode, setOrderCode] = useState<string | null>(null);
  // Set to true once payment completes to prevent "cart empty" flash during redirect
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);

  useEffect(() => {
    const data = actionData as any;
    if (data?.success && data?.paymentData) {
      setPaymentData(data.paymentData as MidtransPaymentData);
      setOrderCode(data.orderCode);
      if (activeOrderFetcher.state === "idle") {
        activeOrderFetcher.load("/api/active-order");
      }
    }
  }, [actionData, activeOrderFetcher, setPaymentData]);

  // Listen for payment success signal from child fetcher (PaymentStep posts to /api/active-order)
  useEffect(() => {
    const handlePaymentSuccess = (e: CustomEvent) => {
      setIsPaymentCompleted(true);
    };
    window.addEventListener(
      "paymentCompleted",
      handlePaymentSuccess as EventListener,
    );
    return () =>
      window.removeEventListener(
        "paymentCompleted",
        handlePaymentSuccess as EventListener,
      );
  }, []);

  const shippingCost = activeOrder?.shippingWithTax ?? 0;
  const orderTotal = activeOrder?.totalWithTax ?? 0;

  // Jika fetcher belum selesai load pertama kali DAN tidak ada order dari loader, tunggu dulu
  const fetcherHasLoaded = activeOrderFetcher.data !== undefined;
  if (!activeOrder && !fetcherHasLoaded) {
    return null; // Render nothing while loader data arrives via fetcher
  }

  // Guard: jika sedang navigating ke confirmation page (post-payment redirect), jangan tampilkan empty cart
  const isNavigatingToConfirmation = navigation.location?.pathname?.startsWith(
    "/checkout/confirmation",
  );
  if (
    !activeOrder &&
    fetcherHasLoaded &&
    (navigation.state !== "idle" ||
      isNavigatingToConfirmation ||
      isPaymentCompleted)
  ) {
    return null;
  }

  // Fetcher sudah selesai tapi order tetap tidak ada → benar-benar kosong
  if (!activeOrder && fetcherHasLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-sans font-bold text-karima-brand mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-karima-ink/70 mb-8">
            It looks like you don't have any items in your checkout.
          </p>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-black hover:bg-karima-brand text-white px-12 py-4 rounded-none uppercase tracking-widest text-xs font-black transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:col-span-12 mb-12 flex justify-center lg:justify-start">
        <Link to="/">
          <img
            src="/images/karima_logo_brown.webp"
            alt="Karima"
            width={125}
            height={125}
          />
        </Link>
      </div>
      {/* LEFT COLUMN: Steps */}
      <div className="lg:col-span-6 flex flex-col order-2 lg:order-1">
        <ContactStep />
        <ShippingAddressStep />
        <DeliveryStep />
        <PaymentStep />

        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 mb-12 lg:mb-20">
          <Link
            to="/returns"
            className="text-xs text-karima-ink/50 underline hover:text-karima-brand transition-colors font-sans decoration-gray-300 underline-offset-4"
          >
            Refund policy
          </Link>
          <Link
            to="/shipping"
            className="text-xs text-karima-ink/50 underline hover:text-karima-brand transition-colors font-sans decoration-gray-300 underline-offset-4"
          >
            Shipping
          </Link>
          <Link
            to="/privacy"
            className="text-xs text-karima-ink/50 underline hover:text-karima-brand transition-colors font-sans decoration-gray-300 underline-offset-4"
          >
            Privacy policy
          </Link>
          <Link
            to="/terms"
            className="text-xs text-karima-ink/50 underline hover:text-karima-brand transition-colors font-sans decoration-gray-300 underline-offset-4"
          >
            Terms of service
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Summary */}
      <div className="lg:col-span-6 mt-0 lg:mt-0 mb-10 lg:mb-0 order-1 lg:order-2">
        <div className="lg:sticky lg:top-10">
          <OrderSummary
            lines={(activeOrder?.lines as any) ?? []}
            subTotal={activeOrder?.subTotalWithTax ?? 0}
            shippingCost={shippingCost}
            total={orderTotal}
            currencyCode={activeOrder?.currencyCode ?? CurrencyCode.Idr}
            activeOrder={activeOrder}
            activeOrderFetcher={activeOrderFetcher}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const data = useLoaderData<typeof loader>();
  const {
    activeOrder: outletOrder, // Renaming to avoid conflict if we use it directly
    activeOrderFetcher,
    applyCoupon,
    removeCoupon,
  } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const fetchers = useFetchers();

  // Monitor all fetchers for payment success signal from PaymentStep.
  // This runs at the route level (never unmounted during navigation) so
  // navigate() is always called from a stable, mounted context.
  useEffect(() => {
    for (const f of fetchers) {
      if (f.data?.success && f.data?.orderCode) {
        // Introduce a small delay to allow browser extensions (like DevTools)
        // to finish processing before we navigate and unmount.
        const timeoutId = setTimeout(() => {
          navigate(`/checkout/confirmation/${f.data.orderCode}`, {
            replace: true,
          });
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [fetchers, navigate]);

  // Priority: outletOrder (live updates) > loader data
  const activeOrder = outletOrder || data.activeOrder;

  return (
    <div className="relative bg-white min-h-screen text-karima-ink font-sans">
      <div
        className="absolute inset-0 flex pointer-events-none"
        aria-hidden="true"
      >
        <div className="w-1/2 bg-white" />
        <div className="w-1/2 bg-gray-50 border-l border-gray-100 hidden lg:block" />
      </div>

      <main className="relative z-10 pt-8 lg:pt-16 pb-20">
        <CheckoutProvider
          activeOrder={activeOrder}
          activeCustomer={data.activeCustomer as any}
          eligibleShippingMethods={data.eligibleShippingMethods as any}
          eligiblePaymentMethods={data.eligiblePaymentMethods as any}
          availableCountries={data.availableCountries as any}
        >
          <CheckoutContent />
        </CheckoutProvider>
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("💥 CHECKOUT PAGE ERROR:", error);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <h1 className="text-2xl font-black font-display text-gray-900 mb-2 uppercase tracking-tight">
          Something Went Wrong
        </h1>
        <p className="text-sm font-medium text-gray-500 mb-8 italic">
          We encountered an issue while loading the checkout page.
        </p>

        {isRouteErrorResponse(error) ? (
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-xs font-black text-gray-400 uppercase mb-1">
              {error.status} {error.statusText}
            </p>
            <p className="text-sm font-bold text-gray-700">{error.data}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left overflow-auto max-h-40">
            <p className="text-[10px] font-mono text-red-800 break-words">
              {(error as any)?.message || "Unknown Error"}
            </p>
          </div>
        )}

        <Link
          to="/checkout"
          className="w-full bg-black hover:bg-karima-brand text-white py-4 px-6 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest inline-block text-center font-sans"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
