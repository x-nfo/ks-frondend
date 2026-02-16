import type { Route } from "./+types/verify";
import { useEffect, useRef } from 'react';
import { useLoaderData, useSearchParams, Form, data, redirect } from "react-router";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { verifyCustomerAccount } from '~/providers/account/account';


type LoaderReturnType = {
    success: boolean;
    error?: string;
    headersJson?: string;
};

export async function loader({
    request,
}: Route.LoaderArgs): Promise<LoaderReturnType> {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    if (!token) {
        return {
            success: false,
            error: "Token verifikasi tidak ditemukan.",
        };
    }

    try {
        const result = await verifyCustomerAccount({ request }, token);
        if (result.__typename !== 'CurrentUser' && 'message' in result) {
            return { success: false, error: (result as any).message };
        }
        if (result.__typename !== 'CurrentUser') {
            return { success: false, error: "Verifikasi gagal." };
        }

        const headersJson = JSON.stringify(Object.fromEntries(result._headers));
        return { success: true, headersJson };
    } catch (error: any) {
        return { success: false, error: "Terjadi kesalahan sistem saat verifikasi." };
    }
}

export async function action({ request }: Route.ActionArgs) {
    const body = await request.formData();
    const headersJson = body.get('headers') as string;
    const redirectTarget = body.get('redirect') as string;

    if (!headersJson) {
        return null;
    }

    const headers = new Headers();
    const headerData = JSON.parse(headersJson);
    Object.keys(headerData).forEach((key) => {
        headers.set(key, headerData[key]);
    });

    return redirect(redirectTarget, { headers });
}

export default function VerifyTokenPage() {
    const [searchParams] = useSearchParams();
    const result = useLoaderData<typeof loader>();
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!result.success || !btnRef.current) {
            return;
        }

        const submitBtn = btnRef.current;
        const timeout = setTimeout(() => submitBtn.click(), 5000);
        return () => clearTimeout(timeout);
    }, [result]);

    return (
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white min-h-screen">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-karima-brand/10 backdrop-blur-sm">
                    {result.success ? (
                        <div className="rounded-md bg-green-50/50 p-4 border border-green-200">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon
                                        className="h-5 w-5 text-green-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 font-medium">
                                        Your account has been successfully verified! Connecting session...
                                    </p>
                                </div>
                                <Form method="post">
                                    <input
                                        type="hidden"
                                        name="redirect"
                                        value={searchParams.get('redirectTo') || '/account'}
                                    />
                                    <input
                                        type="hidden"
                                        name="headers"
                                        value={result.headersJson}
                                    />
                                    <button
                                        ref={btnRef}
                                        type="submit"
                                        className="hidden"
                                    />
                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircleIcon
                                        className="h-5 w-5 text-red-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{result.error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
