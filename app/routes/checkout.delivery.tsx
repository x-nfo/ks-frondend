import { useState, useEffect } from "react";
import { Form, useActionData, useNavigation, useSubmit, data, redirect } from "react-router";
import type { Route } from "./+types/checkout.delivery";
import { useCheckout } from "~/components/checkout/CheckoutProvider";
import { TruckIcon, MapIcon } from "@heroicons/react/24/outline";
import { DestinationSelector } from "~/components/checkout/DestinationSelector";
import { RajaOngkirShippingSelector } from "~/components/checkout/RajaOngkirShippingSelector";
import { useRajaOngkir } from "~/hooks/useRajaOngkir";
import { setOrderShippingAddress, setOrderShippingMethod, getActiveOrder } from "~/providers/orders/order";
import { transitionOrderToState } from "~/providers/checkout/checkout";

export async function action({ request, context }: Route.ActionArgs) {
    const apiUrl =
        (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
        process.env.VENDURE_API_URL ||
        "http://localhost:3000/shop-api";
    const opts = { request, apiUrl };

    const body = await request.formData();
    const actionType = body.get("action");

    if (actionType === "setRajaOngkirDestination") {
        const destinationId = body.get("rajaOngkirDestinationId")?.toString();
        if (destinationId) {
            const currentOrder = await getActiveOrder(opts);
            if (currentOrder?.shippingAddress) {
                const result = await setOrderShippingAddress({
                    fullName: currentOrder.shippingAddress.fullName || "",
                    streetLine1: currentOrder.shippingAddress.streetLine1 || "",
                    streetLine2: currentOrder.shippingAddress.streetLine2 || "",
                    company: currentOrder.shippingAddress.company || "",
                    city: currentOrder.shippingAddress.city || "",
                    province: currentOrder.shippingAddress.province || "",
                    postalCode: currentOrder.shippingAddress.postalCode || "",
                    countryCode: currentOrder.shippingAddress.countryCode || "ID",
                    phoneNumber: currentOrder.shippingAddress.phoneNumber || "",
                    customFields: { rajaOngkirDestinationId: destinationId }
                }, opts);

                const mutationHeaders = result._headers;
                const headers = new Headers();
                if (mutationHeaders?.get("Set-Cookie")) {
                    headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
                }

                if (result.setOrderShippingAddress.__typename !== "Order") {
                    return data({ error: result.setOrderShippingAddress }, { status: 400, headers });
                }
                return data({ success: true }, { headers });
            }
        }
        return data({ success: true });
    }

    if (actionType === "setShippingMethod") {
        const shippingMethodId = body.get("shippingMethodId")?.toString();
        if (shippingMethodId) {
            const result = await setOrderShippingMethod(shippingMethodId, opts);
            const mutationHeaders = result._headers;
            const headers = new Headers();
            if (mutationHeaders?.get("Set-Cookie")) {
                headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
            }

            if (result.setOrderShippingMethod.__typename === "Order") {
                await transitionOrderToState("ArrangingPayment", opts);
                return redirect("/checkout/payment", { headers });
            } else {
                return data({ error: result.setOrderShippingMethod }, { status: 400, headers });
            }
        }
    }

    return data({ error: { message: "Invalid action" } }, { status: 400 });
}

export default function DeliveryRoute() {
    const {
        activeOrder,
        eligibleShippingMethods,
    } = useCheckout();

    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const submit = useSubmit();

    const isSubmittingMethod = navigation.state !== "idle" && navigation.formData?.get("action") === "setShippingMethod";
    const isLoadingDest = navigation.state !== "idle" && navigation.formData?.get("action") === "setRajaOngkirDestination";
    const isGlobalLoading = navigation.state !== "idle";

    const currentShippingMethod = activeOrder?.shippingLines?.[0]?.shippingMethod;

    const {
        searchDestinations,
        selectedDestination,
        setSelectedDestination,
        isLoadingShipping: isSearchingDestinations,
    } = useRajaOngkir();

    const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string | null>(null);

    const availableShippingOptions = eligibleShippingMethods.map((method: any) => ({
        id: method.id,
        courierCode: method.metadata?.courierCode || "custom",
        courierName: method.name,
        service: method.metadata?.service || (method.name.includes(" ") ? method.name.split(" ").pop() : "STD"),
        description: method.description,
        cost: method.price || 0,
        etd: method.metadata?.etd || "",
    }));

    const handleDestinationSelect = (destination: any) => {
        setSelectedDestination(destination);
        if (destination?.id) {
            const formData = new FormData();
            formData.append("action", "setRajaOngkirDestination");
            formData.append("rajaOngkirDestinationId", destination.id.toString());
            submit(formData, { method: "post" });
        }
    };

    const handleShippingMethodChange = (option: any) => {
        setSelectedShippingOptionId(option.id);
    };

    const handleContinue = () => {
        const methodId = selectedShippingOptionId || currentShippingMethod?.id;
        if (methodId) {
            const formData = new FormData();
            formData.append("action", "setShippingMethod");
            formData.append("shippingMethodId", methodId);
            if (selectedDestination?.id) {
                formData.append("rajaOngkirDestinationId", selectedDestination.id.toString());
            }
            submit(formData, { method: "post" });
        }
    };

    const canContinue = !!selectedShippingOptionId || !!currentShippingMethod;
    const savedDestinationId = (activeOrder?.shippingAddress as any)?.customFields?.rajaOngkirDestinationId;
    const [selectedDestinationId, setSelectedDestinationId] = useState<string | number | null>(savedDestinationId || null);

    useEffect(() => {
        if (savedDestinationId && selectedDestinationId !== savedDestinationId) {
            setSelectedDestinationId(savedDestinationId);
        }

        if (
            savedDestinationId &&
            availableShippingOptions.length === 0 &&
            !isGlobalLoading &&
            !isSearchingDestinations
        ) {
            const formData = new FormData();
            formData.append("action", "setRajaOngkirDestination");
            formData.append("rajaOngkirDestinationId", savedDestinationId.toString());
            submit(formData, { method: "post" });
        }
    }, [
        savedDestinationId,
        availableShippingOptions.length,
        isGlobalLoading,
        isSearchingDestinations,
        selectedDestinationId,
        submit
    ]);

    const errorMessage = (actionData as any)?.error?.message;

    return (
        <div className="bg-transparent mb-8">
            <div className="py-6 px-0 flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <h2 className="text-xl font-bold font-sans leading-tight text-karima-brand">
                        Shipping Method
                    </h2>
                </div>
            </div>

            <div className="pb-10 pt-4 px-0 lg:px-0 animate-in fade-in duration-500 space-y-8">
                {!selectedDestinationId && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                            <MapIcon className="w-4 h-4" /> Search Delivery Area
                        </div>
                        <DestinationSelector
                            selectedDestination={selectedDestination}
                            onSelect={handleDestinationSelect}
                            onSearch={searchDestinations}
                            initialQuery={activeOrder?.shippingAddress?.postalCode || ""}
                        />
                    </div>
                )}

                {selectedDestinationId && !selectedDestination && activeOrder?.shippingAddress?.city && (
                    <div className="p-4 bg-karima-brand/5 border border-karima-brand/10 rounded-sm flex items-start gap-4">
                        <div className="w-10 h-10 bg-karima-brand/10 flex items-center justify-center text-karima-brand flex-shrink-0 border border-karima-brand/20 shadow-inner">
                            <MapIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-karima-brand uppercase tracking-widest mb-1 font-sans">
                                Shipping Location
                            </p>
                            <p className="text-sm font-bold text-karima-ink leading-tight font-sans">
                                {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.province} {activeOrder.shippingAddress.postalCode}
                            </p>
                            <button
                                onClick={() => setSelectedDestinationId(null)}
                                className="text-[10px] underline text-karima-ink/40 hover:text-karima-brand mt-1 uppercase tracking-wider font-bold"
                            >
                                Change destination
                            </button>
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                    </div>
                )}

                {(selectedDestination || (selectedDestinationId && availableShippingOptions.length > 0)) && (
                    <div className="animate-in fade-in duration-700">
                        <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest mb-4 font-sans max-w-2xl">
                            <TruckIcon className="w-4 h-4" /> Available Shipping Options
                        </div>
                        <div className="max-w-2xl">
                            <RajaOngkirShippingSelector
                                shippingOptions={availableShippingOptions}
                                selectedOptionId={selectedShippingOptionId || currentShippingMethod?.id || null}
                                onChange={handleShippingMethodChange}
                                isLoading={isLoadingDest || isSearchingDestinations}
                            />
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t border-karima-brand/5">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!canContinue || isSubmittingMethod || isLoadingDest}
                        className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSubmittingMethod ? "Processing..." : "Continue to Payment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
