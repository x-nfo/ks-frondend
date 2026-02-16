import type { Route } from "./+types/reset-password";
import { data, useFetcher, useSearchParams, Link, redirect } from "react-router";
import { resetPassword } from "../providers/account/account";
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '~/components/Button';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

import { useForm, getFormProps, getInputProps } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { Input } from '~/components/Input';

export function meta() {
    return [{ title: "Reset Password - Karima Syari" }];
}

const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: resetPasswordSchema });

    if (submission.status !== 'success') {
        return data(submission.reply(), { status: 400 });
    }

    const { token, password } = submission.value;

    try {
        console.log("Attempting password reset with token:", token);
        const result = await resetPassword(token, password, { request });
        console.log("Password reset result:", result);

        if (result?.__typename === 'CurrentUser') {
            return data({ success: true, headers: result._headers });
        } else {
            const errorMsg = (result && 'message' in result) ? result.message : `An error occurred (${result?.__typename || 'Unknown'}).`;
            return data(submission.reply({ formErrors: [errorMsg] }), { status: 400 });
        }
    } catch (error: any) {
        console.error("Reset password error:", error);
        return data(submission.reply({ formErrors: ["An unexpected error occurred."] }), { status: 500 });
    }
}

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const fetcher = useFetcher<typeof action>();
    const isSuccess = fetcher.data && 'success' in fetcher.data;
    const token = searchParams.get('token');

    const [form, fields] = useForm({
        id: 'reset-password-form',
        lastResult: fetcher.data as any,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: resetPasswordSchema });
        },
        shouldValidate: 'onBlur',
        shouldRevalidate: 'onInput',
        defaultValue: {
            token: token || '',
        }
    });

    if (!token && !isSuccess) {
        return (
            <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
                        <h2 className="mt-4 text-xl font-bold text-red-800">Invalid or Missing Token</h2>
                        <p className="mt-2 text-sm text-red-700">
                            The password reset link is invalid or has expired. Please request a new link.
                        </p>
                        <div className="mt-6">
                            <Link
                                to="/forgot-password"
                                className="inline-block px-4 py-2 bg-karima-brand text-white rounded-md font-medium"
                            >
                                Request New Link
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl text-karima-brand font-bold font-serif">
                    Set New Password
                </h2>
                <p className="mt-2 text-center text-sm text-karima-ink/70">
                    Create a new password for your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircleIcon className="h-12 w-12 text-green-500" />
                            </div>
                            <h3 className="text-lg font-bold text-karima-brand">Success!</h3>
                            <p className="text-sm text-karima-ink/70">
                                Your password has been successfully updated. You can now log in.
                            </p>
                            <div className="pt-4">
                                <Link
                                    to="/sign-in"
                                    className="px-6 py-2 bg-karima-brand text-white rounded-md font-medium hover:bg-karima-brand/90 transition-colors"
                                >
                                    Log In Now
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <fetcher.Form method="post" {...getFormProps(form)}>
                            <fieldset disabled={fetcher.state !== 'idle'} className="space-y-6">
                                <input {...getInputProps(fields.token, { type: 'hidden' })} />

                                <div>
                                    <Input
                                        {...getInputProps(fields.password, { type: 'password' })}
                                        label="New Password"
                                        placeholder="Min. 8 characters"
                                        autoComplete="new-password"
                                        required
                                        error={fields.password.errors?.join(', ')}
                                    />
                                </div>

                                <div>
                                    <Input
                                        {...getInputProps(fields.confirmPassword, { type: 'password' })}
                                        label="Confirm Password"
                                        placeholder="Repeat new password"
                                        autoComplete="new-password"
                                        required
                                        error={fields.confirmPassword.errors?.join(', ')}
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
                                            Reset Password
                                        </span>
                                    </Button>
                                </div>
                            </fieldset>
                        </fetcher.Form>
                    )}
                </div>
            </div>
        </div>
    );
}
