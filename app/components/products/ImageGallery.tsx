import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "100%" : direction < 0 ? "-100%" : 0,
      opacity: 1, // Keep opacity at 1 for pure slide
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? "100%" : direction > 0 ? "-100%" : 0,
      opacity: 1, // Keep opacity at 1 for pure slide
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function ImageGallery({
  images,
  selectedImage,
  onSelectImage,
  isTransitioning = false,
}: ImageGalleryProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  // Sync internal index when selectedImage changes externally (e.g. via variant selection)
  useEffect(() => {
    if (selectedImage && images.length > 0) {
      const index = images.findIndex((img) => img.id === selectedImage.id);
      if (index !== -1 && index !== page) {
        // Determine direction based on whether new index is > or < current page
        const newDirection = index > page ? 1 : -1;
        setPage([index, newDirection]);
      }
    }
  }, [selectedImage, images, page]);

  const paginate = (newDirection: number) => {
    let newIndex = page + newDirection;
    if (newIndex >= images.length) newIndex = 0;
    if (newIndex < 0) newIndex = images.length - 1;

    setPage([newIndex, newDirection]);
    onSelectImage(images[newIndex]);
  };

  if (!images || images.length === 0) {
    // Fallback or empty state if needed. purely defensive given usage context
    return <div className="aspect-[4/5] bg-stone-100"></div>;
  }

  // Ensure we have a valid index even if props are weird
  const safeIndex = page >= 0 && page < images.length ? page : 0;
  const currentImage = images[safeIndex];

  return (
    <div className="space-y-4">
      {/* Main Slider */}
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 group flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentImage.id || currentImage.preview}
            src={currentImage.preview + "?w=1000"}
            alt={`Product view ${safeIndex + 1}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.6 },
            }}
            drag={images.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(-1);
              }}
              className="absolute z-20 left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-karima-brand rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                paginate(1);
              }}
              className="absolute z-20 right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-karima-brand rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0"
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
                const newDirection = idx > page ? 1 : -1;
                setPage([idx, newDirection]);
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
