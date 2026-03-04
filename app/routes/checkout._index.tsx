import { redirect, data } from "react-router";
import type { Route } from "./+types/checkout._index";
import { getActiveOrder } from "~/providers/orders/order";

export async function loader({ request, context }: Route.LoaderArgs) {
  const apiUrl =
    (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
    process.env.VENDURE_API_URL ||
    "http://localhost:3000/shop-api";
  const opts = { request, apiUrl };

  const activeOrder = await getActiveOrder(opts);

  if (!activeOrder || activeOrder.lines.length === 0) {
    // If there is no active order, we can't do anything here, let the layout handle the empty state
    return data(null);
  }

  // Routing logic based on order state
  // 1. If we don't have a customer email, go to contact
  if (!activeOrder.customer) {
    return redirect("/checkout/contact");
  }

  // 2. If we don't have a shipping address, go to shipping
  if (!activeOrder.shippingAddress?.streetLine1) {
    return redirect("/checkout/shipping");
  }

  // 3. If we don't have a shipping method, go to delivery
  if (!activeOrder.shippingLines || activeOrder.shippingLines.length === 0) {
    return redirect("/checkout/delivery");
  }

  // 4. If everything is set, go to payment
  return redirect("/checkout/payment");
}

export default function CheckoutIndexPage() {
  // If we reach here, it means the layout is handling an empty cart state
  return null;
}
