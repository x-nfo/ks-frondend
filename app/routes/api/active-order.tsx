import type { Route } from "./+types/active-order";
import {
  addItemToOrder,
  adjustOrderLine,
  getActiveOrder,
  getOrderByCode,
  removeOrderLine,
  setCustomerForOrder,
  setOrderShippingAddress,
  setOrderShippingMethod,
  setOrderBillingAddress,
} from "../../providers/orders/order";
import {
  transitionOrderToState,
  addPaymentToOrder,
  getNextOrderStates,
  applyCouponCode,
  removeCouponCode,
} from "../../providers/checkout/checkout";
import { data } from "react-router";
import {
  type CreateAddressInput,
  type CreateCustomerInput,
  ErrorCode,
  type ErrorResult,
  type ExtendedOrderDetailFragment,
} from "../../generated/graphql";
import { getSession, commitSession } from "../../sessions";
import { shippingFormDataIsValid } from "../../utils/validation";

export type CartLoaderData = {
  activeOrder: any;
  error?: ErrorResult;
};

function getEnvApiUrl(context: any): string {
  return (
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api"
  );
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl = getEnvApiUrl(context);
  return {
    activeOrder: await getActiveOrder({ request, apiUrl }),
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const apiUrl = getEnvApiUrl(context);
  const body = await request.formData();
  const formAction = body.get("action");
  let activeOrder: ExtendedOrderDetailFragment | undefined = undefined;
  let error: ErrorResult | undefined = undefined;
  let mutationHeaders: Headers | undefined = undefined;

  const opts = { request, apiUrl };

  switch (formAction) {
    case "setCheckoutShipping":
      if (shippingFormDataIsValid(body)) {
        const destinationId = body.get("rajaOngkirDestinationId")?.toString();
        const result = await setOrderShippingAddress(
          {
            city: body.get("city")?.toString() || "",
            company: body.get("company")?.toString() || "",
            countryCode: body.get("countryCode")?.toString() || "ID",
            customFields: {
              rajaOngkirDestinationId: destinationId || undefined,
            },
            fullName: body.get("fullName")?.toString() || "",
            phoneNumber: body.get("phoneNumber")?.toString() || "",
            postalCode: body.get("postalCode")?.toString() || "",
            province: body.get("province")?.toString() || "",
            streetLine1: body.get("streetLine1")?.toString() || "",
            streetLine2: body.get("streetLine2")?.toString() || "",
          },
          opts,
        );
        mutationHeaders = result._headers;
        if (result.setOrderShippingAddress.__typename === "Order") {
          activeOrder = result.setOrderShippingAddress;
        } else {
          error = result.setOrderShippingAddress as ErrorResult;
        }
      }
      break;
    case "setRajaOngkirDestination": {
      const destinationId = body.get("rajaOngkirDestinationId")?.toString();
      if (destinationId) {
        const currentOrder = await getActiveOrder(opts);
        if (currentOrder?.shippingAddress) {
          const result = await setOrderShippingAddress(
            {
              fullName: currentOrder.shippingAddress.fullName || "",
              streetLine1: currentOrder.shippingAddress.streetLine1 || "",
              streetLine2: currentOrder.shippingAddress.streetLine2 || "",
              company: currentOrder.shippingAddress.company || "",
              city: currentOrder.shippingAddress.city || "",
              province: currentOrder.shippingAddress.province || "",
              postalCode: currentOrder.shippingAddress.postalCode || "",
              countryCode: currentOrder.shippingAddress.countryCode || "ID",
              phoneNumber: currentOrder.shippingAddress.phoneNumber || "",
              customFields: {
                rajaOngkirDestinationId: destinationId,
              },
            },
            opts,
          );
          mutationHeaders = result._headers;
          if (result.setOrderShippingAddress.__typename === "Order") {
            activeOrder = result.setOrderShippingAddress;
          } else {
            error = result.setOrderShippingAddress as ErrorResult;
          }
        }
      }
      break;
    }
    case "setOrderBillingAddress": {
      const fullName = body.get("fullName")?.toString();
      const streetLine1 = body.get("streetLine1")?.toString();
      const city = body.get("city")?.toString();
      const province = body.get("province")?.toString();
      const postalCode = body.get("postalCode")?.toString();
      const countryCode = body.get("countryCode")?.toString();
      const phoneNumber = body.get("phoneNumber")?.toString();

      if (fullName && streetLine1 && city && countryCode) {
        const result = await setOrderBillingAddress(
          {
            fullName,
            streetLine1,
            city,
            province: province || "",
            postalCode: postalCode || "",
            countryCode,
            phoneNumber: phoneNumber || "",
          },
          opts,
        );
        mutationHeaders = result._headers;
        if (result.setOrderBillingAddress.__typename === "Order") {
          activeOrder = result.setOrderBillingAddress;
        } else {
          error = result.setOrderBillingAddress as ErrorResult;
        }
      }
      break;
    }
    case "setOrderCustomer": {
      const customerData = Object.fromEntries<any>(
        body.entries(),
      ) as CreateCustomerInput;
      const result = await setCustomerForOrder(
        {
          emailAddress: customerData.emailAddress,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
        },
        opts,
      );
      mutationHeaders = result._headers;
      if (result.setCustomerForOrder.__typename === "Order") {
        activeOrder = result.setCustomerForOrder;
      } else {
        error = result.setCustomerForOrder as ErrorResult;
      }
      break;
    }
    case "setShippingMethod": {
      const shippingMethodId = body.get("shippingMethodId");
      if (typeof shippingMethodId === "string") {
        const result = await setOrderShippingMethod(shippingMethodId, opts);
        mutationHeaders = result._headers;
        if (result.setOrderShippingMethod.__typename === "Order") {
          // Transition to ArrangingPayment so payment methods are available in the next fetch
          await transitionOrderToState("ArrangingPayment", opts);
          activeOrder = result.setOrderShippingMethod;
        } else {
          error = result.setOrderShippingMethod as ErrorResult;
        }
      }
      break;
    }
    case "removeItem": {
      const lineId = body.get("lineId");
      const result = await removeOrderLine(lineId?.toString() ?? "", opts);
      mutationHeaders = result._headers;
      if (result.removeOrderLine.__typename === "Order") {
        activeOrder = result.removeOrderLine;
      } else {
        error = result.removeOrderLine as ErrorResult;
      }
      break;
    }
    case "adjustItem": {
      const lineId = body.get("lineId");
      const quantity = body.get("quantity");
      if (lineId && quantity != null) {
        const result = await adjustOrderLine(
          lineId?.toString(),
          +quantity,
          opts,
        );
        mutationHeaders = result._headers;
        if (result.adjustOrderLine.__typename === "Order") {
          activeOrder = result.adjustOrderLine;
        } else {
          error = result.adjustOrderLine as ErrorResult;
        }
      }
      break;
    }
    case "addItemToOrder": {
      const variantId = body.get("variantId")?.toString();
      const quantity = Number(body.get("quantity")?.toString() ?? 1);
      if (!variantId || !(quantity > 0)) {
        error = {
          errorCode: ErrorCode.NoActiveOrderError,
          message: "Invalid variant or quantity",
        };
        break;
      }

      const result = await addItemToOrder(variantId!, quantity, opts);
      mutationHeaders = result._headers;
      if (result.addItemToOrder.__typename === "Order") {
        activeOrder = result.addItemToOrder;
      } else {
        error = result.addItemToOrder as ErrorResult;
      }
      break;
    }
    case "completeOrder": {
      const paymentMethodCode = body.get("paymentMethodCode")?.toString();
      const midtransMetadata = body.get("midtransMetadata")?.toString();

      if (paymentMethodCode) {
        // Update billing address if provided in form
        if (body.get("billingAddress_streetLine1")) {
          const billingResult = await setOrderBillingAddress(
            {
              fullName: body.get("billingAddress_fullName")?.toString() || "",
              streetLine1:
                body.get("billingAddress_streetLine1")?.toString() || "",
              city: body.get("billingAddress_city")?.toString() || "",
              province: body.get("billingAddress_province")?.toString() || "",
              postalCode:
                body.get("billingAddress_postalCode")?.toString() || "",
              countryCode:
                body.get("billingAddress_countryCode")?.toString() || "",
              phoneNumber:
                body.get("billingAddress_phoneNumber")?.toString() || "",
            },
            opts,
          );

          if (billingResult.setOrderBillingAddress.__typename !== "Order") {
            error = billingResult.setOrderBillingAddress as ErrorResult;
            break; // Stop and return error
          }
        } else {
          // Fallback to shipping if no billing
          const currentOrder = await getActiveOrder(opts);
          if (
            currentOrder &&
            !currentOrder.billingAddress?.streetLine1 &&
            currentOrder.shippingAddress?.streetLine1
          ) {
            const billingResult = await setOrderBillingAddress(
              {
                fullName: currentOrder.shippingAddress.fullName || "",
                streetLine1: currentOrder.shippingAddress.streetLine1,
                city: currentOrder.shippingAddress.city || "",
                province: currentOrder.shippingAddress.province || "",
                postalCode: currentOrder.shippingAddress.postalCode || "",
                countryCode: currentOrder.shippingAddress.countryCode || "",
                phoneNumber: currentOrder.shippingAddress.phoneNumber || "",
              },
              opts,
            );

            if (billingResult.setOrderBillingAddress.__typename !== "Order") {
              error = billingResult.setOrderBillingAddress as ErrorResult;
              break; // Stop and return error
            }
          }
        }

        // Ensure transition to ArrangingPayment
        const orderToTransition = await getActiveOrder(opts);
        if (
          orderToTransition &&
          orderToTransition.state !== "ArrangingPayment"
        ) {
          await transitionOrderToState("ArrangingPayment", opts);
        }

        const paymentInput: any = {
          method: paymentMethodCode,
          metadata: midtransMetadata ? JSON.parse(midtransMetadata) : {},
        };

        const result = await addPaymentToOrder(paymentInput, opts);
        mutationHeaders = result._headers;

        if (result.addPaymentToOrder.__typename === "Order") {
          const headers = new Headers();
          if (mutationHeaders?.get("Set-Cookie")) {
            headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
          }
          return data(
            {
              success: true,
              orderCode: result.addPaymentToOrder.code,
            },
            { headers },
          );
        } else {
          error = result.addPaymentToOrder as ErrorResult;
        }
      }
      break;
    }
    case "applyCoupon": {
      const couponCode = body.get("couponCode")?.toString();
      if (couponCode) {
        // Get current order state before applying
        const previousOrder = await getActiveOrder(opts);
        const previousTotal = previousOrder?.totalWithTax || 0;
        const previousLineCount = previousOrder?.lines?.length || 0;

        const result = await applyCouponCode(couponCode, opts);
        mutationHeaders = (result as any)._headers;

        if (result.applyCouponCode?.__typename === "Order") {
          const newOrder = result.applyCouponCode;
          const newTotal = newOrder.totalWithTax;
          const newLineCount = newOrder.lines?.length || 0;

          // Check effectiveness: Did price drop OR did items increase (gift)?
          // Also ensure we actually have active discounts now
          const hasDiscounts = (newOrder.discounts?.length || 0) > 0;
          const isPriceLower = newTotal < previousTotal;
          const hasNewItems = newLineCount > previousLineCount;

          // If coupon is valid but had NO effect (no price drop, no gift item), treat as inapplicable
          if (!isPriceLower && !hasNewItems && !hasDiscounts) {
            // Revert the coupon
            await removeCouponCode(couponCode, opts);

            // Return error to UI
            error = {
              errorCode: "COUPON_NOT_APPLICABLE",
              message:
                "Coupon code is valid but does not apply to any items in your cart.",
            } as unknown as ErrorResult;

            // Keep the PREVIOUS order state for the UI
            activeOrder = previousOrder as ExtendedOrderDetailFragment;
          } else {
            // Success
            activeOrder = newOrder;
          }
        } else if (result.applyCouponCode) {
          error = result.applyCouponCode as unknown as ErrorResult;
        }
      }
      break;
    }
    case "removeCoupon": {
      const couponCode = body.get("couponCode")?.toString();
      if (couponCode) {
        const result = await removeCouponCode(couponCode, opts);
        mutationHeaders = (result as any)._headers;
        if (result.removeCouponCode?.__typename === "Order") {
          activeOrder = result.removeCouponCode;
        } else if (result.removeCouponCode) {
          error = result.removeCouponCode as unknown as ErrorResult;
        }
      }
      break;
    }
  }

  const finale = await getActiveOrder(opts);
  const sdkCookie =
    finale?._headers.get("Set-Cookie") || mutationHeaders?.get("Set-Cookie");
  const session = await getSession(sdkCookie || request.headers.get("Cookie"));

  if (error) {
    session.flash("activeOrderError", error);
  }

  const headers = new Headers();
  if (finale && finale._headers && finale._headers.get("Set-Cookie")) {
    headers.append("Set-Cookie", finale._headers.get("Set-Cookie")!);
  }
  headers.append("Set-Cookie", await commitSession(session));

  return data({ activeOrder: activeOrder || finale, error }, { headers });
}
