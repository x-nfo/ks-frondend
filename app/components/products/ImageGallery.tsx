import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Asset {
    id: string;
    preview: string;
}

export interface ImageGalleryProps {
    images: Asset[];
    selectedImage: Asset | undefined;
    onSelectImage: (asset: Asset) => void;
    isTransitioning?: boolean;
}

export function ImageGallery({
    images,
    selectedImage,
    onSelectImage,
    isTransitioning = false,
}: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    // Sync internal index when selectedImage changes externally (e.g. via variant selection)
    useEffect(() => {
        if (selectedImage) {
            const index = images.findIndex((img) => img.id === selectedImage.id);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [selectedImage, images]);

    const handlePrevious = () => {
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        onSelectImage(images[newIndex]);
    };

    const handleNext = () => {
        const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        onSelectImage(images[newIndex]);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (!touchStartX.current || !touchEndX.current) return;
        const distance = touchStartX.current - touchEndX.current;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrevious();
        }

        touchStartX.current = null;
        touchEndX.current = null;
    };

    if (!images || images.length === 0) {
        // Fallback or empty state if needed. purely defensive given usage context
        return <div className="aspect-[4/5] bg-stone-100"></div>;
    }

    // Ensure we have a valid index even if props are weird
    const safeIndex = currentIndex >= 0 && currentIndex < images.length ? currentIndex : 0;
    const currentImage = images[safeIndex];

    return (
        <div className="space-y-4">
            {/* Main Slider */}
            <div
                className="relative aspect-[4/5] overflow-hidden bg-stone-100 group"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="w-full h-full flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${safeIndex * 100}%)` }}
                >
                    {images.map((img, idx) => (
                        <div key={img.id} className="w-full h-full flex-shrink-0 relative">
                            <img
                                src={img.preview + "?w=1000"}
                                alt={`Product view ${idx + 1}`}
                                className="w-full h-full object-cover"
                                // Only apply viewTransitionName to the currently visible image to avoid conflicts? 
                                // Or effectively only the active one matters. 
                                // The original code tried to transition 'image-expand'.
                                // We can apply it conditionally.
                                style={{
                                    viewTransitionName: isTransitioning ? "none" : (idx === safeIndex ? "image-expand" : undefined)
                                }}
                            />
                            <div className="absolute inset-0 bg-black/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-karima-brand rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-karima-brand rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
                            aria-label="Next image"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {images.map((asset, idx) => (
                        <button
                            key={asset.id}
                            onClick={() => {
                                setCurrentIndex(idx);
                                onSelectImage(asset);
                            }}
                            className={`aspect-[4/5] overflow-hidden bg-stone-100 transition-all duration-300 relative ${idx === safeIndex
                                ? "ring-1 ring-karima-brand ring-offset-2 ring-offset-white opacity-100"
                                : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={asset.preview + "?w=300&h=375&fit=crop"}
                                className="w-full h-full object-cover"
                                alt={`Thumbnail ${idx + 1}`}
                            />
                            {idx === safeIndex && (
                                <div className="absolute inset-0 bg-karima-brand/5 pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
