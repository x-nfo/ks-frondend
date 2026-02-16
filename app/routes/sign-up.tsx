import type { Route } from "./+types/sign-up";
import { data, Form, useActionData, useNavigation, Link, useSearchParams, redirect } from "react-router";
import { registerCustomerAccount as registerCustomer } from "../providers/account/account";
import { XCircleIcon } from '@heroicons/react/24/solid';
import {
    extractRegistrationFormValues,
    validateRegistrationForm,
} from '~/utils/registration-helper';
import type { RegisterValidationErrors } from '~/utils/registration-helper';


export function meta() {
    return [{ title: "Daftar Akun - Karima Syari" }];
}


export async function action({ request }: Route.ActionArgs) {
    const body = await request.formData();
    const fieldErrors = validateRegistrationForm(body);
    if (Object.keys(fieldErrors).length !== 0) {
        return data(fieldErrors, { status: 400 });
    }

    const registrationFormValues = extractRegistrationFormValues(body);
    try {
        const result = await (registerCustomer as any)(
            {
                firstName: registrationFormValues.input.firstName || '',
                lastName: registrationFormValues.input.lastName || '',
                emailAddress: registrationFormValues.input.emailAddress || '',
                password: registrationFormValues.input.password,
                phoneNumber: registrationFormValues.input.phoneNumber,
            } as any,
            { request },
        );

        if (result.__typename === 'Success') {
            return redirect('/sign-up/success');
        }

        if (result.__typename !== 'Success' && 'errorCode' in result) {
            return data({
                form: (result as any).message,
                errorCode: (result as any).errorCode,
            }, { status: 401 });
        }
        // Fallback for other non-success cases if needed, or rethrow
        return data({ form: "Terjadi kesalahan yang tidak diketahui." }, { status: 500 });

    } catch (error: any) {
        console.error("Registration error:", error);
        let message = "";
        try {
            const parsed = JSON.parse(error?.message || "{}");
            message = parsed.message || "";
        } catch {
            message = error?.message || "";
        }
        console.error("Parsed registration error:", message);
        return data({ form: message || "An unexpected error occurred." }, { status: 500 });
    }
}


export default function SignUpPage() {
    const [searchParams] = useSearchParams();
    const formErrors = useActionData<RegisterValidationErrors>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <>
            <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl text-karima-brand font-bold font-serif">
                        Create Account
                    </h2>

                    <p className="mt-2 text-center text-sm text-karima-ink/70">
                        Or{' '}
                        <Link
                            to="/sign-in"
                            className="font-medium text-karima-accent hover:text-karima-brand transition-colors"
                        >
                            Log In
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
                        {/* Demo message from docs if needed, but here we use a generic one if available */}
                        <div className="bg-karima-gold/10 border border-karima-gold/20 text-karima-brand rounded p-4 text-center text-sm mb-6 font-medium">
                            <p>Please fill in the details below to register.</p>
                        </div>

                        <Form className="space-y-6" method="post">
                            <input
                                type="hidden"
                                name="redirectTo"
                                value={searchParams.get('redirectTo') ?? undefined}
                            />
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-karima-brand focus:border-karima-brand sm:text-sm"
                                    />
                                    {formErrors?.email && (
                                        <div className="text-xs text-red-700 mt-1">
                                            {formErrors.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    First Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-karima-brand focus:border-karima-brand sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Last Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-karima-brand focus:border-karima-brand sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-karima-brand focus:border-karima-brand sm:text-sm"
                                    />
                                    {formErrors?.password && (
                                        <div className="text-xs text-red-700 mt-1">
                                            {formErrors.password}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="repeatPassword"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Repeat Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="repeatPassword"
                                        name="repeatPassword"
                                        type="password"
                                        autoComplete="current-password"
                                        className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-karima-brand focus:border-karima-brand sm:text-sm"
                                    />
                                    {formErrors?.repeatPassword && (
                                        <div className="text-xs text-red-700 mt-1">
                                            {formErrors.repeatPassword}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {formErrors?.form && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <XCircleIcon
                                                className="h-5 w-5 text-red-400"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Registration Error
                                            </h3>
                                            <p className="text-sm text-red-700 mt-2">
                                                {formErrors.form}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-karima-brand hover:bg-karima-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karima-brand disabled:opacity-50"
                                >
                                    {isSubmitting ? "Loading..." : "Sign Up"}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    );
}
