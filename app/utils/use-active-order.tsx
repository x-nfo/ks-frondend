import { useFetcher } from "react-router";
import { type CartLoaderData } from "../routes/api/active-order";
import { useEffect } from "react";

export function useActiveOrder() {
  const activeOrderFetcher = useFetcher<CartLoaderData>();
  useEffect(() => {
    if (activeOrderFetcher.state === "idle" && !activeOrderFetcher.data) {
      activeOrderFetcher.load("/api/active-order");
    }
  }, [activeOrderFetcher]);

  function refresh() {
    activeOrderFetcher.load("/api/active-order");
  }

  const activeOrder = activeOrderFetcher.data?.activeOrder;

  const removeItem = (lineId: string) => {
    activeOrderFetcher.submit(
      {
        action: "removeItem",
        lineId,
      },
      {
        method: "post",
        action: "/api/active-order",
      },
    );
  };
  const adjustOrderLine = (lineId: string, quantity: number) => {
    activeOrderFetcher.submit(
      {
        action: "adjustItem",
        lineId,
        quantity: quantity.toString(),
      },
      {
        method: "post",
        action: "/api/active-order",
      },
    );
  };
  const applyCoupon = (couponCode: string) => {
    activeOrderFetcher.submit(
      {
        action: "applyCoupon",
        couponCode,
      },
      {
        method: "post",
        action: "/api/active-order",
      },
    );
  };

  const removeCoupon = (couponCode: string) => {
    activeOrderFetcher.submit(
      {
        action: "removeCoupon",
        couponCode,
      },
      {
        method: "post",
        action: "/api/active-order",
      },
    );
  };

  return {
    activeOrderFetcher,
    activeOrder,
    removeItem,
    adjustOrderLine,
    refresh,
    applyCoupon,
    removeCoupon,
  };
}
