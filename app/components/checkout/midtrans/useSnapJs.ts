import { useEffect, useState, useCallback, useRef } from 'react';
import type { MidtransSnapCallbacks } from './types';

declare global {
    interface Window {
        snap: {
            pay: (token: string, callbacks?: MidtransSnapCallbacks) => void;
        };
    }
}

interface UseSnapJsOptions {
    clientKey: string;
    isProduction: boolean;
}

/**
 * Custom hook to load and use Midtrans Snap.js
 *
 * Dynamically loads the Snap.js script tag and provides a `payWithSnap()`
 * function to trigger the Snap payment popup.
 */
export function useSnapJs({ clientKey, isProduction }: UseSnapJsOptions) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadAttempted = useRef(false);

    useEffect(() => {
        if (!clientKey || loadAttempted.current) return;
        loadAttempted.current = true;

        // Check if already loaded
        if (window.snap) {
            setIsLoaded(true);
            return;
        }

        const scriptUrl = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        // Check if script tag already exists
        const existing = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existing) {
            // Script exists but might still be loading
            if (window.snap) {
                setIsLoaded(true);
            } else {
                existing.addEventListener('load', () => setIsLoaded(true));
                existing.addEventListener('error', () => setError('Failed to load Midtrans Snap.js'));
            }
            return;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;

        script.onload = () => {
            setIsLoaded(true);
        };
        script.onerror = () => {
            setError('Failed to load Midtrans Snap.js');
        };

        document.head.appendChild(script);

        return () => {
            // Don't remove the script on cleanup — it should persist
        };
    }, [clientKey, isProduction]);

    const payWithSnap = useCallback(
        (token: string, callbacks?: MidtransSnapCallbacks) => {
            if (!window.snap) {
                console.error('[useSnapJs] Snap.js not loaded yet');
                callbacks?.onError?.({
                    order_id: '',
                    transaction_status: 'error',
                    payment_type: '',
                    gross_amount: '',
                    status_code: '500',
                    status_message: 'Snap.js not loaded',
                });
                return;
            }

            window.snap.pay(token, {
                onSuccess: (result) => {
                    console.log('[Snap] Payment success:', result.order_id);
                    callbacks?.onSuccess?.(result);
                },
                onPending: (result) => {
                    console.log('[Snap] Payment pending:', result.order_id);
                    callbacks?.onPending?.(result);
                },
                onError: (result) => {
                    console.error('[Snap] Payment error:', result);
                    callbacks?.onError?.(result);
                },
                onClose: () => {
                    console.log('[Snap] Popup closed by user');
                    callbacks?.onClose?.();
                },
            });
        },
        [],
    );

    return { isLoaded, error, payWithSnap };
}
