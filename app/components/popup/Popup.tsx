import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PopupProps {
    imageUrl: string;
    title?: string;
    linkUrl?: string;
    delay?: number;
    frequency?: string;
}

export default function Popup({ imageUrl, title, linkUrl, delay = 3, frequency = 'once_per_session' }: PopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('hasSeenPopup');

        if (frequency === 'once_per_session' && hasSeenPopup) {
            return;
        }

        const timer = setTimeout(() => {
            setShouldRender(true);
            // Small delay to allow enter animation
            requestAnimationFrame(() => setIsVisible(true));
        }, delay * 1000);

        return () => clearTimeout(timer);
    }, [delay, frequency]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => setShouldRender(false), 300); // Wait for exit animation
        if (frequency === 'once_per_session') {
            sessionStorage.setItem('hasSeenPopup', 'true');
        }
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            />
            <div
                className={`relative bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                {linkUrl ? (
                    <a href={linkUrl} onClick={handleClose} className="block w-full">
                        <img
                            src={imageUrl}
                            alt={title || "Popup Promo"}
                            className="w-full h-auto object-cover"
                        />
                    </a>
                ) : (
                    <div className="w-full">
                        <img
                            src={imageUrl}
                            alt={title || "Popup Promo"}
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
