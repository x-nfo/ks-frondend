import { useEffect, useState } from 'react';

interface DateDisplayProps {
    date: string | Date | number | undefined;
    format?: Intl.DateTimeFormatOptions;
    className?: string;
    showTimezone?: boolean;
}

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
};

/**
 * Component to display dates in WIB (Asia/Jakarta) timezone.
 * Handles hydration mismatch by rendering only after client-side mount.
 */
export function DateDisplay({
    date,
    format = DEFAULT_FORMAT,
    className,
    showTimezone = true
}: DateDisplayProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!date) return <span className={className}>--</span>;

    const d = new Date(date);

    // Format the date. We force Asia/Jakarta to ensure it's always WIB
    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        ...format,
        timeZone: 'Asia/Jakarta',
    }).format(d);

    // If not mounted yet, we can render a placeholder or the UTC string 
    // to avoid hydration mismatch if the server and client have different default locales.
    // However, forcing 'id-ID' and 'Asia/Jakarta' on both sides usually works, 
    // but useEffect is the "bulletproof" way for React Router 7 / Remix.
    if (!isMounted) {
        // Return a span with the same structure but maybe hidden or a placeholder
        return <span className={className} style={{ visibility: 'hidden' }}>{formattedDate}</span>;
    }

    return (
        <span className={className}>
            {formattedDate} {showTimezone ? 'WIB' : ''}
        </span>
    );
}
