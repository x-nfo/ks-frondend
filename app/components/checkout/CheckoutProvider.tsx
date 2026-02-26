import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useOutletContext } from "react-router";
import type { OutletContext } from "~/types";
import type {
  Order,
  ShippingMethod,
  PaymentMethod,
  Customer,
} from "~/generated/graphql";
import type { MidtransPaymentData } from "./midtrans/types";

export type CheckoutStep = "contact" | "address" | "delivery" | "payment";

interface CheckoutContextType {
  activeOrder: Order | null | undefined;
  activeCustomer: Customer | null | undefined;
  eligibleShippingMethods: ShippingMethod[];
  eligiblePaymentMethods: PaymentMethod[];
  availableCountries: { code: string; name: string }[];

  currentStep: CheckoutStep;
  stepsStatus: Record<CheckoutStep, "pending" | "current" | "completed">;
  goToStep: (step: CheckoutStep) => void;
  completeStep: (step: CheckoutStep) => void;

  activeOrderFetcher: any;
  isLoading: boolean;
  paymentData: MidtransPaymentData | null;
  setPaymentData: (data: MidtransPaymentData | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

interface CheckoutProviderProps {
  children: ReactNode;
  activeOrder: Order | null | undefined;
  activeCustomer: Customer | null | undefined;
  eligibleShippingMethods: ShippingMethod[];
  eligiblePaymentMethods: PaymentMethod[];
  availableCountries: { code: string; name: string }[];
}

export function CheckoutProvider({
  children,
  activeOrder,
  activeCustomer,
  eligibleShippingMethods,
  eligiblePaymentMethods,
  availableCountries,
}: CheckoutProviderProps) {
  const { activeOrderFetcher } = useOutletContext<OutletContext>();

  // Determine initial step based on order state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(() => {
    if (!activeCustomer && !activeOrder?.customer) return "contact";
    if (!activeOrder?.shippingAddress?.streetLine1) return "address";
    if (!activeOrder?.shippingLines?.length) return "delivery";
    return "payment";
  });

  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(
    () => {
      const completed = new Set<CheckoutStep>();
      if (activeCustomer || activeOrder?.customer) completed.add("contact");
      if (activeOrder?.shippingAddress?.streetLine1) {
        completed.add("contact");
        completed.add("address");
      }
      if (activeOrder?.shippingLines?.length) {
        completed.add("contact");
        completed.add("address");
        completed.add("delivery");
      }
      return completed;
    },
  );

  const getStepStatus = (step: CheckoutStep) => {
    if (currentStep === step) return "current";
    if (completedSteps.has(step)) return "completed";
    return "pending";
  };

  const stepsStatus: Record<CheckoutStep, "pending" | "current" | "completed"> =
    {
      contact: getStepStatus("contact"),
      address: getStepStatus("address"),
      delivery: getStepStatus("delivery"),
      payment: getStepStatus("payment"),
    };

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const completeStep = (step: CheckoutStep) => {
    setCompletedSteps((prev) => new Set(prev).add(step));

    // Auto-advance
    const orderNodes: CheckoutStep[] = [
      "contact",
      "address",
      "delivery",
      "payment",
    ];
    const currentIndex = orderNodes.indexOf(step);
    if (currentIndex < orderNodes.length - 1) {
      setCurrentStep(orderNodes[currentIndex + 1]);
    }
  };

  useEffect(() => {
    if (activeOrder?.customer && !completedSteps.has("contact")) {
      setCompletedSteps((prev) => new Set(prev).add("contact"));
    }
    if (
      activeOrder?.shippingAddress?.streetLine1 &&
      !completedSteps.has("address")
    ) {
      setCompletedSteps((prev) => new Set(prev).add("address"));
    }
    if (activeOrder?.shippingLines?.length && !completedSteps.has("delivery")) {
      setCompletedSteps((prev) => new Set(prev).add("delivery"));
    }
  }, [activeOrder, completedSteps]);

  const [paymentData, setPaymentData] = useState<MidtransPaymentData | null>(
    null,
  );

  // Hanya blok interaksi saat sedang submit mutation, bukan saat loading/revalidasi
  const isLoading = activeOrderFetcher.state === "submitting";

  return (
    <CheckoutContext.Provider
      value={{
        activeOrder,
        activeCustomer,
        eligibleShippingMethods,
        eligiblePaymentMethods,
        availableCountries,
        currentStep,
        stepsStatus,
        goToStep,
        completeStep,
        activeOrderFetcher,
        isLoading,
        paymentData,
        setPaymentData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}
