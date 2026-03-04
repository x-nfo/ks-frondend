import { useState, useEffect } from "react";
import { Form, Link, useActionData, useNavigation, redirect, data } from "react-router";
import type { Route } from "./+types/checkout.contact";
import { useCheckout } from "~/components/checkout/CheckoutProvider";
import { FloatingLabelInput } from "~/components/checkout/FloatingLabelInput";
import { setCustomerForOrder, getActiveOrder } from "~/providers/orders/order";

export async function action({ request, context }: Route.ActionArgs) {
    const apiUrl =
        (context?.cloudflare?.env as any)?.VENDURE_API_URL ||
        process.env.VENDURE_API_URL ||
        "http://localhost:3000/shop-api";
    const opts = { request, apiUrl };

    const body = await request.formData();
    const emailAddress = body.get("emailAddress")?.toString();
    const firstName = body.get("firstName")?.toString();
    const lastName = body.get("lastName")?.toString();
    const isContinue = body.get("action") === "continue";

    if (isContinue) {
        return redirect("/checkout/shipping");
    }

    if (!emailAddress || !firstName || !lastName) {
        return data({ error: { message: "All fields are required" } }, { status: 400 });
    }

    const result = await setCustomerForOrder(
        { emailAddress, firstName, lastName },
        opts
    );

    const mutationHeaders = result._headers;

    if (result.setCustomerForOrder.__typename === "Order") {
        // Success! Redirect to next step
        const headers = new Headers();
        if (mutationHeaders?.get("Set-Cookie")) {
            headers.append("Set-Cookie", mutationHeaders.get("Set-Cookie")!);
        }
        return redirect("/checkout/shipping", { headers });
    } else {
        // Return error to the UI
        return data({ error: result.setCustomerForOrder }, { status: 400 });
    }
}

export default function ContactRoute() {
    const { activeOrder, activeCustomer } = useCheckout();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";

    const [guestEmail, setGuestEmail] = useState(activeOrder?.customer?.emailAddress || "");
    const [guestFirstName, setGuestFirstName] = useState(activeOrder?.customer?.firstName || "");
    const [guestLastName, setGuestLastName] = useState(activeOrder?.customer?.lastName || "");

    useEffect(() => {
        if (activeOrder?.customer) {
            setGuestEmail(activeOrder.customer.emailAddress || "");
            setGuestFirstName(activeOrder.customer.firstName || "");
            setGuestLastName(activeOrder.customer.lastName || "");
        }
    }, [activeOrder?.customer]);

    const fetcherError = (actionData as any)?.error;
    let errorMessage = null;
    if (fetcherError) {
        const errorCode = fetcherError.errorCode;
        if (errorCode === "EMAIL_ADDRESS_CONFLICT_ERROR") {
            errorMessage = 'This email is already registered. If you have shopped with us as a guest before, you might not have a password yet. Please use the "Forgot Password" link to set one.';
        } else if (errorCode === "ALREADY_LOGGED_IN_ERROR") {
            errorMessage = "You are already logged in. Please refresh the page.";
        } else {
            errorMessage = fetcherError.message || "An error occurred. Please try again.";
        }
    }

    return (
        <div className="bg-transparent mb-8">
            <div className="py-6 px-0 flex items-center justify-between">
                <div className="flex items-center gap-x-4">
                    <h2 className="text-xl font-bold text-karima-brand font-sans leading-tight">
                        Contact Information
                    </h2>
                    {!activeCustomer && (
                        <p className="text-xs text-karima-ink/60 font-sans italic">
                            Already have an account?{" "}
                            <Link
                                to={`/sign-in?redirectTo=${encodeURIComponent("/checkout/shipping")}`}
                                className="text-karima-brand font-bold underline hover:text-karima-brand/80"
                            >
                                Log in
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            <div className="pb-10 pt-4 animate-in fade-in duration-500">
                {activeCustomer ? (
                    <Form method="post" className="space-y-6">
                        <input type="hidden" name="action" value="continue" />
                        <div className="p-6 bg-karima-brand/5 border border-karima-brand/10 rounded-sm">
                            <p className="text-sm text-karima-brand font-medium">
                                Logged in as{" "}
                                <span className="font-bold">{activeCustomer.emailAddress}</span>
                            </p>
                            <p className="text-xs text-karima-ink/60 mt-1">
                                Name: {activeCustomer.firstName} {activeCustomer.lastName}
                            </p>
                        </div>
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? "Proceeding..." : "Continue to Shipping"}
                            </button>
                        </div>
                    </Form>
                ) : (
                    <Form method="post" className="space-y-6">
                        <div className="space-y-6">
                            <FloatingLabelInput
                                id="emailAddress"
                                name="emailAddress"
                                type="email"
                                label="Email *"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                required
                                icon={null}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FloatingLabelInput
                                id="firstName"
                                name="firstName"
                                type="text"
                                label="First Name *"
                                value={guestFirstName}
                                onChange={(e) => setGuestFirstName(e.target.value)}
                                required
                                icon={null}
                            />
                            <FloatingLabelInput
                                id="lastName"
                                name="lastName"
                                type="text"
                                label="Last Name *"
                                value={guestLastName}
                                onChange={(e) => setGuestLastName(e.target.value)}
                                required
                                icon={null}
                            />
                        </div>

                        {errorMessage && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-sm font-medium text-red-700">{errorMessage}</p>
                                {errorMessage.includes("already registered") && (
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        <Link
                                            to={`/sign-in?redirectTo=${encodeURIComponent("/checkout/shipping")}`}
                                            className="text-sm font-bold text-red-700 underline hover:text-red-900"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to={`/forgot-password?email=${encodeURIComponent(guestEmail)}`}
                                            className="text-sm font-bold text-red-700 underline hover:text-red-900"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black hover:bg-karima-brand text-white py-4 px-8 rounded-none transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 font-sans disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isSubmitting ? "Saving..." : "Continue to Shipping"}
                            </button>
                        </div>
                    </Form>
                )}
            </div>
        </div>
    );
}
