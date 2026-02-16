import type { Route } from "./+types/forgot-password";
import { data, useFetcher, useSearchParams, Link } from "react-router";
import { requestPasswordReset } from "../providers/account/account";
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '~/components/Button';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { Input } from '~/components/Input';

export function meta() {
    return [{ title: "Forgot Password - Karima Syari" }];
}

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: forgotPasswordSchema });

    if (submission.status !== 'success') {
        return data(submission.reply(), { status: 400 });
    }

    const { email } = submission.value;

    try {
        const result = await requestPasswordReset(email, { request });
        if (result?.__typename === 'Success') {
            return data({ success: true });
        } else {
            console.error("Forgot password mutation result:", result);
            const errorMsg = (result && 'message' in result) ? result.message : `An error occurred (${result?.__typename || 'Unknown'}).`;
            return data(submission.reply({ formErrors: [errorMsg] }), { status: 400 });
        }
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return data(submission.reply({ formErrors: ["An unexpected error occurred."] }), { status: 500 });
    }
}

export default function ForgotPasswordPage() {
    const [searchParams] = useSearchParams();
    const fetcher = useFetcher<typeof action>();
    const isSuccess = fetcher.data && 'success' in fetcher.data;

    const [form, fields] = useForm({
        id: 'forgot-password-form',
        lastResult: fetcher.data as any,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: forgotPasswordSchema });
        },
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
        defaultValue: {
            email: searchParams.get('email') || '',
        }
    });

    return (
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl text-karima-brand font-bold font-serif">
                    Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-karima-ink/70">
                    Enter your email to receive a password reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircleIcon className="h-12 w-12 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-karima-brand">Check Your Email</h3>
                            <p className="text-sm text-karima-ink/70">
                                If an account exists with that email, we've sent a password reset link.
                            </p>
                            <div className="pt-4">
                                <Link
                                    to="/sign-in"
                                    className="text-sm font-medium text-karima-accent hover:text-karima-brand transition-colors"
                                >
                                    Back to Sign In
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <fetcher.Form method="post" {...getFormProps(form)}>
                            <fieldset disabled={fetcher.state !== 'idle'} className="space-y-6">
                                <div>
                                    <Input
                                        {...getInputProps(fields.email, { type: 'email' })}
                                        label="Email Address"
                                        placeholder="Email Address"
                                        autoComplete="email"
                                        required
                                        error={fields.email.errors?.join(', ')}
                                    />
                                </div>

                                {form.errors && (
                                    <div className="rounded-md bg-red-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                                <p className="text-sm text-red-700 mt-2">
                                                    {form.errors.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Button
                                        type="submit"
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-karima-brand hover:bg-karima-brand/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karima-brand"
                                    >
                                        <span className="flex gap-4 items-center">
                                            {fetcher.state !== 'idle' && (
                                                <ArrowPathIcon className="animate-spin h-5 w-5 text-gray-400" />
                                            )}
                                            Send Reset Link
                                        </span>
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <Link
                                        to="/sign-in"
                                        className="text-sm font-medium text-karima-accent hover:text-karima-brand transition-colors"
                                    >
                                        Return to Sign In
                                    </Link>
                                </div>
                            </fieldset>
                        </fetcher.Form>
                    )}
                </div>
            </div>
        </div>
    );
}
