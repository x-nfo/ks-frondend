import { useState } from "react";
import { Form, useActionData, useNavigation, redirect, useSubmit, data } from "react-router";
import type { Route } from "./+types/checkout.shipping";
import { useCheckout } from "~/components/checkout/CheckoutProvider";
import {
    MapPinIcon,
    PlusIcon,
    BookmarkSquareIcon,
} from "@heroicons/react/24/outline";
import { ShippingAddressSelector } from "~/components/checkout/ShippingAddressSelector";
import { AddressForm } from "~/components/account/AddressForm";
import { shippingFormDataIsValid } from "~/utils/validation";
import { setOrderShippingAddress } from "~/providers/orders/order";

export async function action({ request, context }: Route.ActionArgs) {
    const apiUrl =
        (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
        process.env.VENDURE_API_URL ||
        "http://localhost:3000/shop-api";
    const opts = { request, apiUrl };

    const body = await request.formData();

    if (!shippingFormDataIsValid(body)) {
        return data({ error: { message: "Invalid form data" } }, { status: 400 });
    }

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

    const mutationHeaders = result._headers;

    if (result.setOrderShippingAddress.__typename === "Order") {
        const headers = new Headers();
        if (mutationHeaders?.get("Set-Cookie")) {
            headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
        }
        return redirect("/checkout/delivery", { headers });
    } else {
        return data({ error: result.setOrderShippingAddress }, { status: 400 });
    }
}

export default function ShippingRoute() {
    const {
        activeOrder,
        activeCustomer,
        availableCountries,
    } = useCheckout();

    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [isUsingSavedAddress, setIsUsingSavedAddress] = useState(
        !!activeCustomer && (activeCustomer.addresses?.length ?? 0) > 0,
    );

    const addresses = activeCustomer?.addresses ?? [];
    const shippingAddress = activeOrder?.shippingAddress;

    const defaultFullName =
        shippingAddress?.fullName ??
        (activeOrder?.customer
            ? `${activeOrder.customer.firstName} ${activeOrder.customer.lastName}`
            : ``);

    const [localError, setLocalError] = useState<string | null>(null);

    const submitAddressForm = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalError(null);
        const formData = new FormData(event.currentTarget);
        if (!shippingFormDataIsValid(formData)) {
            setLocalError("Please fill out all required fields.");
            return;
        }
        submit(formData, { method: "post" });
    };

    const handleAddressSelect = (index: number) => {
        setSelectedAddressIndex(index);
        setLocalError(null);
    };

    const handleContinueSavedAddress = () => {
        const selectedAddress = addresses[selectedAddressIndex];
        if (selectedAddress) {
            if (!selectedAddress.phoneNumber) {
                setLocalError(
                    "Selected address does not have a phone number. Please update or use a new address.",
                );
                return;
            }
            setLocalError(null);
            const formData = new FormData();
            const allowedFields = [
                "fullName",
                "company",
                "streetLine1",
                "streetLine2",
                "city",
                "province",
                "postalCode",
                "phoneNumber",
            ];
            allowedFields.forEach((field) => {
                const value = (selectedAddress as any)[field];
                if (value) formData.append(field, value);
            });
            formData.append("countryCode", selectedAddress.country.code);
            const savedDestId = (selectedAddress as any).customFields
                ?.rajaOngkirDestinationId;
            if (savedDestId) {
                formData.append("rajaOngkirDestinationId", savedDestId.toString());
            }

            submit(formData, { method: "post" });
        }
    };

    const serverError = (actionData as any)?.error?.message;
    const errorMessage = localError || serverError;

    return (
        <div className="bg-transparent mb-8">
            <div className="py-6 px-0 flex items-center justify-between">
                <div className="flex items-start gap-4">
                    <div>
                        <h2 className="text-xl font-bold font-sans leading-tight text-karima-brand">
                            Delivery details
                        </h2>
                    </div>
                </div>
            </div>

            <div className="pb-10 pt-4 px-0 lg:px-0 animate-in fade-in duration-500">
                <Form onSubmit={submitAddressForm} method="post">
                    {isUsingSavedAddress ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                                <BookmarkSquareIcon className="w-4 h-4" /> Select Saved Address
                            </div>

                            <ShippingAddressSelector
                                addresses={addresses as any}
                                selectedAddressIndex={selectedAddressIndex}
                                onChange={handleAddressSelect}
                            />

                            <div className="flex justify-center">
                                <button
                                    type="button"
                                    className="text-sm font-bold text-karima-brand hover:text-karima-brand/80 flex items-center gap-2 group p-2 rounded-lg hover:bg-karima-brand/5 transition-all font-sans"
                                    onClick={() => setIsUsingSavedAddress(false)}
                                >
                                    <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                    Add New Address
                                </button>
                            </div>

                            {errorMessage && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm font-medium text-red-700">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleContinueSavedAddress}
                                    disabled={isSubmitting}
                                    className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? "Processing..." : "Continue to Delivery"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-black text-karima-ink/40 uppercase tracking-widest font-sans">
                                    <MapPinIcon className="w-4 h-4" /> Enter New Address
                                </div>
                                {activeCustomer && (
                                    <button
                                        type="button"
                                        className="text-xs font-bold text-karima-brand hover:underline font-sans"
                                        onClick={() => setIsUsingSavedAddress(true)}
                                    >
                                        Back to Saved Addresses
                                    </button>
                                )}
                            </div>

                            <AddressForm
                                availableCountries={availableCountries as any}
                                address={shippingAddress as any}
                                defaultFullName={defaultFullName}
                            />

                            {errorMessage && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-sm font-medium text-red-700">
                                        {errorMessage}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    {isSubmitting ? "Processing..." : "Continue to Delivery"}
                                </button>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}
