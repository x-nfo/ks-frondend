import { useState, useEffect } from "react";
import { useActionData, useNavigation, useSubmit, data, redirect } from "react-router";
import type { Route } from "./+types/checkout.payment";
import { useCheckout } from "~/components/checkout/CheckoutProvider";
import { MidtransPayments } from "~/components/checkout/midtrans";
import { BillingAddressSection } from "~/components/checkout/BillingAddressSection";
import clsx from "clsx";
import { setOrderBillingAddress, getActiveOrder } from "~/providers/orders/order";
import { transitionOrderToState, addPaymentToOrder, getNextOrderStates } from "~/providers/checkout/checkout";

export async function action({ request, context }: Route.ActionArgs) {
    const apiUrl = (context?.cloudflare?.env as any)?.VENDURE_API_URL || process.env.VENDURE_API_URL || "http://localhost:3000/shop-api";
    const opts = { request, apiUrl };

    const body = await request.formData();
    const actionType = body.get("action");

    if (actionType === "setOrderBillingAddress") {
        const fullName = body.get("fullName")?.toString();
        const streetLine1 = body.get("streetLine1")?.toString();
        const city = body.get("city")?.toString();
        const province = body.get("province")?.toString() || "";
        const postalCode = body.get("postalCode")?.toString() || "";
        const countryCode = body.get("countryCode")?.toString();
        const phoneNumber = body.get("phoneNumber")?.toString() || "";

        if (fullName && streetLine1 && city && countryCode) {
            const result = await setOrderBillingAddress({
                fullName, streetLine1, city, province, postalCode, countryCode, phoneNumber
            }, opts);

            const mutationHeaders = result._headers;
            const headers = new Headers();
            if (mutationHeaders?.get("Set-Cookie")) headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);

            if (result.setOrderBillingAddress.__typename === "Order") {
                return data({ success: true, action: "setOrderBillingAddress" }, { headers });
            } else {
                return data({ error: result.setOrderBillingAddress }, { status: 400, headers });
            }
        }
    }

    if (actionType === "completeOrder") {
        const paymentMethodCode = body.get("paymentMethodCode")?.toString();
        const midtransMetadata = body.get("midtransMetadata")?.toString();

        if (paymentMethodCode) {
            const orderToCheck = await getActiveOrder(opts);
            if (!orderToCheck) return data({ error: { message: "No active order found" } }, { status: 400 });
            if (!orderToCheck.customer) return data({ error: { message: "Customer information is missing" } }, { status: 400 });
            if (!orderToCheck.shippingAddress?.streetLine1) return data({ error: { message: "Shipping address is missing" } }, { status: 400 });
            if (!orderToCheck.shippingLines?.length) return data({ error: { message: "Shipping method Not selected" } }, { status: 400 });

            if (orderToCheck.state === "AddingItems") {
                const { nextOrderStates } = await getNextOrderStates(opts);
                if (nextOrderStates.includes("ArrangingPayment")) {
                    const transitionResult = await transitionOrderToState("ArrangingPayment", opts);
                    if ((transitionResult.transitionOrderToState as any)?.__typename !== "Order") {
                        return data({ error: { message: (transitionResult.transitionOrderToState as any)?.message || "Failed to set order state" } }, { status: 400 });
                    }
                }
            }

            let metadata: Record<string, any> = {};
            if (midtransMetadata) {
                try { metadata = { ...metadata, ...JSON.parse(midtransMetadata) } } catch (e) { }
            }

            const result = await addPaymentToOrder({ method: paymentMethodCode, metadata }, opts);
            const mutationHeaders = result._headers;

            if (result.addPaymentToOrder.__typename === "Order") {
                const order = result.addPaymentToOrder;
                const headers = new Headers();
                if (mutationHeaders?.get("Set-Cookie")) headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
                return redirect(`/checkout/confirmation/${order.code}`, { headers });
            } else {
                const headers = new Headers();
                if (mutationHeaders?.get("Set-Cookie")) headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
                return data({ error: result.addPaymentToOrder }, { status: 400, headers });
            }
        }
    }

    return data({ error: { message: "Invalid action" } }, { status: 400 });
}

export default function PaymentRoute() {
    const {
        activeOrder,
        eligiblePaymentMethods,
        availableCountries,
        isLoading: isGlobalLoading,
    } = useCheckout();

    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const submit = useSubmit();

    const isSubmitting = navigation.state !== "idle";
    const currentAction = navigation.formData?.get("action")?.toString();

    const [isBillingSaved, setIsBillingSaved] = useState(false);

    useEffect(() => {
        if ((actionData as any)?.success && (actionData as any)?.action === "setOrderBillingAddress") {
            setIsBillingSaved(true);
        }
    }, [actionData]);

    const [useSameAsShipping, setUseSameAsShipping] = useState(true);
    const [billingAddressData, setBillingAddressData] = useState<any>(activeOrder?.shippingAddress);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
    const [paymentMetadata, setPaymentMetadata] = useState<string>("");

    const shippingAddress = activeOrder?.shippingAddress;
    const orderTotal = activeOrder?.totalWithTax ?? 0;

    const handleBillingAddressChange = (useSame: boolean, address?: any) => {
        setUseSameAsShipping(useSame);
        setBillingAddressData(useSame ? shippingAddress : address);
    };

    const handleSaveBilling = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("action", "setOrderBillingAddress");
        const addr = useSameAsShipping ? shippingAddress : billingAddressData;
        if (addr) {
            if (addr.fullName) formData.append("fullName", addr.fullName);
            if (addr.streetLine1) formData.append("streetLine1", addr.streetLine1);
            if (addr.streetLine2) formData.append("streetLine2", addr.streetLine2);
            if (addr.city) formData.append("city", addr.city);
            if (addr.province) formData.append("province", addr.province);
            if (addr.postalCode) formData.append("postalCode", addr.postalCode);
            if (addr.countryCode || addr.country?.code) formData.append("countryCode", addr.countryCode || addr.country?.code || "ID");
            if (addr.phoneNumber) formData.append("phoneNumber", addr.phoneNumber);
            submit(formData, { method: "post" });
        }
    };

    const handleCompleteOrder = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("action", "completeOrder");
        formData.append("paymentMethodCode", selectedPaymentMethod);
        if (paymentMetadata) {
            formData.append("midtransMetadata", paymentMetadata);
        }
        submit(formData, { method: "post" });
    };

    const canCompleteOrder = !!selectedPaymentMethod;
    const isSavingBilling = isSubmitting && currentAction === "setOrderBillingAddress";
    const isCompletingOrder = isSubmitting && currentAction === "completeOrder";

    const errorMessage = (actionData as any)?.error?.message;

    return (
        <div className="bg-transparent sm:rounded-none mb-8">
            <div className="py-6 px-0 flex items-center justify-between border-b border-gray-100">
                <h2 className="text-xl font-bold text-karima-brand font-sans leading-tight">
                    Payment
                </h2>
            </div>

            <div className="pb-6 pt-4 px-0 lg:px-0 space-y-8 animate-in fade-in duration-500">
                <div className={clsx("space-y-6", isBillingSaved && "opacity-50 pointer-events-none")}>
                    <BillingAddressSection
                        availableCountries={availableCountries.map((c) => ({ ...c, id: c.code })) as any}
                        shippingAddress={shippingAddress as any}
                        billingAddress={billingAddressData}
                        onBillingAddressChange={handleBillingAddressChange}
                        defaultFullName={
                            activeOrder?.customer
                                ? `${activeOrder.customer.firstName} ${activeOrder.customer.lastName}`
                                : ""
                        }
                        namePrefix="billingAddress_"
                    />

                    {!isBillingSaved && (
                        <form onSubmit={handleSaveBilling}>
                            <button
                                type="submit"
                                disabled={isSavingBilling || isGlobalLoading}
                                className="w-full bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50"
                            >
                                {isSavingBilling ? "Saving Address..." : "Confirm Billing Address"}
                            </button>
                        </form>
                    )}

                    {isBillingSaved && (
                        <div className="flex justify-end">
                            <button
                                onClick={() => setIsBillingSaved(false)}
                                className="text-[10px] font-black uppercase tracking-widest text-karima-brand hover:underline pointer-events-auto"
                            >
                                Edit Billing Address
                            </button>
                        </div>
                    )}
                </div>

                {isBillingSaved && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-4">
                            <h3 className="text-sm font-black text-karima-ink/40 uppercase tracking-widest border-l-4 border-karima-brand pl-4 font-sans">
                                Select Payment Method
                            </h3>
                            {eligiblePaymentMethods.length === 0 && (
                                <p className="text-red-500 text-sm italic">
                                    No payment methods available.
                                </p>
                            )}
                            <div className="grid gap-4">
                                {eligiblePaymentMethods.some((p: any) => p.code.includes("midtrans")) && (
                                    <MidtransPayments
                                        paymentMethodCode={eligiblePaymentMethods.find((p: any) => p.code.includes("midtrans"))?.code || "midtrans-payment"}
                                        currencyCode={activeOrder?.currencyCode ?? "IDR"}
                                        totalAmount={orderTotal}
                                        paymentError={(actionData as any)?.error}
                                        onPaymentSelect={(code, metadata) => { setSelectedPaymentMethod(code); setPaymentMetadata(metadata); }}
                                        hideSubmitButton={true}
                                    />
                                )}

                                {eligiblePaymentMethods.filter((p: any) => p.code === "manual-payment-bsi").map((paymentMethod: any) => (
                                    <div
                                        key={paymentMethod.id}
                                        className={clsx(
                                            "p-4 border-2 rounded-xl transition-all duration-300 cursor-pointer",
                                            selectedPaymentMethod === paymentMethod.code ? "border-karima-brand bg-karima-brand/5" : "border-gray-200 hover:border-gray-300 bg-white"
                                        )}
                                        onClick={() => setSelectedPaymentMethod(paymentMethod.code)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center shrink-0", selectedPaymentMethod === paymentMethod.code ? "border-karima-brand bg-karima-brand" : "border-gray-300")}>
                                                {selectedPaymentMethod === paymentMethod.code && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <span className="font-bold font-sans text-karima-ink">{paymentMethod.name || "Transfer Bank Manual (BSI)"}</span>
                                                <p className="text-xs text-karima-ink/60 mt-1">
                                                    Konfirmasi pembayaran manual via WhatsApp setelah pesanan dibuat.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <form onSubmit={handleCompleteOrder}>
                                <button
                                    type="submit"
                                    disabled={!canCompleteOrder || isCompletingOrder || isGlobalLoading}
                                    className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isCompletingOrder ? "Processing Order..." : "Complete Order"}
                                </button>
                            </form>

                            {errorMessage && currentAction === "completeOrder" && (
                                <p className="mt-4 text-sm text-red-600 font-bold italic text-center">
                                    Error: {errorMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
