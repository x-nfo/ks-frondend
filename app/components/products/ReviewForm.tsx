import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

import { useFetcher, useNavigate } from "react-router";
import { classNames } from "../../utils/class-names";
import { Input } from "~/components/Input";

interface ReviewFormProps {
    productId: string;
    productSlug: string;
    isLoggedIn: boolean;
    hasPurchased: boolean;
    activeCustomer?: any;
    reviews?: any[];
}

export default function ReviewForm({ productId, productSlug, isLoggedIn, hasPurchased, activeCustomer, reviews = [] }: ReviewFormProps) {
    const fetcher = useFetcher();
    const navigate = useNavigate();

    // Identify existing review
    const customerName = activeCustomer ? `${activeCustomer.firstName} ${activeCustomer.lastName}` : "";
    const existingReview = reviews.find(r => r.authorName === customerName);

    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const isSubmitting = fetcher.state === "submitting";
    const data = fetcher.data as { success?: boolean; error?: string } | undefined;
    const isSuccess = data?.success;
    const error = data?.error;

    // Handle authentication errors - redirect to sign-in
    useEffect(() => {
        if (data && !data.success && data.error === "auth_required") {
            const redirectTo = encodeURIComponent(window.location.pathname);
            navigate(`/sign-in?redirectTo=${redirectTo}`);
        }
    }, [data, navigate]);

    if (!isLoggedIn || !hasPurchased) {
        return null;
    }

    if (isSuccess || (existingReview && !isSubmitting && !isEditing)) {
        const reviewToShow = existingReview;
        const isPending = reviewToShow?.state === "new" || reviewToShow?.state === "Pending"; // Adjust based on actual state values

        return (
            <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
                <div className={classNames(
                    "rounded-lg p-6",
                    isPending ? "bg-amber-50" : "bg-green-50"
                )}>
                    <h3 className={classNames(
                        "text-lg font-medium mb-2 font-serif",
                        isPending ? "text-amber-800" : "text-green-800"
                    )}>
                        {isPending ? "Review Pending Approval" : "Review Approved"}
                    </h3>
                    <p className={classNames(
                        "font-sans text-sm",
                        isPending ? "text-amber-600" : "text-green-600"
                    )}>
                        {isPending
                            ? "Thank you for your review. It is currently being moderated and will be visible to everyone once approved."
                            : "Your review has been approved and is now visible on the product page."}
                    </p>
                    {reviewToShow && (
                        <div className="mt-4 pt-4 border-t border-black/5">
                            <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                        key={star}
                                        className={classNames(
                                            "h-4 w-4",
                                            star <= reviewToShow.rating ? "text-yellow-500" : "text-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                            <p className="font-medium text-gray-900 font-sans">{reviewToShow.summary}</p>
                            <p className="mt-1 text-gray-600 text-sm font-sans">{reviewToShow.body}</p>
                        </div>
                    )}
                </div>
                {!isPending && (
                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-sm text-gray-500 font-sans italic">
                            Reviews can currently only be submitted once per product purchase.
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setRating(existingReview.rating);
                                setIsEditing(true);
                            }}
                            className="text-karima-brand hover:text-karima-brand/80 text-sm font-medium font-sans flex items-center gap-2 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                            Edit Review
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-50">
            <h3 className="text-xl font-medium text-gray-900 mb-6 font-serif">
                Write a Review
            </h3>

            <fetcher.Form method="post" action="/api/reviews">
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="rating" value={rating} />

                {/* Star Rating */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-sans">
                        Your Rating *
                    </label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                {(hoverRating || rating) >= star ? (
                                    <StarIcon className="h-6 w-6 text-yellow-500" />
                                ) : (
                                    <StarOutlineIcon className="h-6 w-6 text-gray-300 hover:text-yellow-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="mb-6">
                    <Input
                        name="summary"
                        label="Summary *"
                        required
                        maxLength={100}
                        defaultValue={existingReview?.summary}
                        placeholder="Brief summary of your review"
                        className="font-sans"
                    />
                </div>

                {/* Body */}
                <div className="mb-6">
                    <label
                        htmlFor="body"
                        className="block text-sm font-medium text-gray-700 mb-2 font-sans"
                    >
                        Your Review *
                    </label>
                    <textarea
                        id="body"
                        name="body"
                        required
                        rows={4}
                        defaultValue={existingReview?.body}
                        placeholder="Share your experience with this product..."
                        className="block w-full py-2 px-4 shadow-sm border bg-white rounded-md text-base sm:text-sm text-karima-ink border-gray-300 placeholder-gray-400 focus:ring-karima-brand focus:border-karima-brand focus:outline-none focus:ring-1 resize-none font-sans"
                    />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm font-sans border border-red-100">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={Boolean(isSubmitting || rating === 0)}
                        suppressHydrationWarning
                        className={classNames(
                            "px-8 py-3 rounded-md text-white font-medium transition-all duration-200 font-sans text-sm tracking-wide",
                            isSubmitting || rating === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#8B9BB4] hover:bg-[#7A8AA3] shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        )}
                    >
                        {isSubmitting
                            ? "Submitting..."
                            : existingReview ? "Update Review" : "Submit Review"}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium font-sans"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </fetcher.Form>
        </div>
    );
}
