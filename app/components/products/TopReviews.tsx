import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon, ShareIcon } from "@heroicons/react/24/outline";
import { Disclosure, DisclosureButton, DisclosurePanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { classNames } from "../../utils/class-names";


interface Review {
    id: string;
    createdAt: string;
    rating: number;
    summary: string;
    body: string;
    state: string;
    authorName: string;
}

interface TopReviewsProps {
    reviews: Review[];
    canReview?: boolean;
    productName: string;
}

export default function TopReviews({ reviews, canReview = false, productName }: TopReviewsProps) {
    const totalReviews = reviews ? reviews.length : 0;

    return (
        <div className="border-t border-karima-brand/10 w-full">
            <div className="mx-auto px-4 sm:px-6">
                <Disclosure defaultOpen>
                    {({ open }) => (
                        <>
                            <DisclosureButton className="flex w-full justify-between items-center py-6 text-left focus:outline-none group">
                                <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-karima-brand group-hover:text-karima-brand/80 transition-colors">
                                    Rating and Review
                                </span>
                                <span className="ml-6 flex items-center">
                                    {open ? (
                                        <span className="h-0.5 w-3 bg-karima-brand group-hover:bg-karima-brand/80 transition-colors" />
                                    ) : (
                                        <span className="relative flex items-center justify-center">
                                            <span className="absolute h-0.5 w-3 bg-karima-brand group-hover:bg-karima-brand/80 transition-colors" />
                                            <span className="absolute h-3 w-0.5 bg-karima-brand group-hover:bg-karima-brand/80 transition-colors" />
                                        </span>
                                    )}
                                </span>
                            </DisclosureButton>

                            <DisclosurePanel className="pb-10 animate-fadeIn">
                                {reviews && reviews.length > 0 && (
                                    <div className="mb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-karima-brand/10 pb-12">
                                        <div className="lg:col-span-4 flex flex-col justify-center">
                                            <div className="flex items-baseline gap-4">
                                                <span className="text-6xl font-serif text-karima-brand">{reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}</span>
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon
                                                            key={star}
                                                            className={classNames(
                                                                (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) >= star
                                                                    ? "text-gray-900"
                                                                    : "text-gray-200",
                                                                "h-6 w-6 flex-shrink-0"
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="mt-2 text-sm text-karima-brand/60">Based on {reviews.length} Reviews</p>
                                        </div>
                                        <div className="lg:col-span-8 flex flex-col justify-center space-y-2">
                                            {[5, 4, 3, 2, 1].map((rating) => {
                                                const count = reviews.filter((r) => r.rating === rating).length;
                                                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                                                return (
                                                    <div key={rating} className="flex items-center text-sm">
                                                        <div className="flex items-center flex-1">
                                                            <div className="flex items-center w-24">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <StarIcon
                                                                        key={star}
                                                                        className={classNames(
                                                                            rating >= star
                                                                                ? "text-gray-400"
                                                                                : "text-gray-200",
                                                                            "h-4 w-4 flex-shrink-0"
                                                                        )}
                                                                        aria-hidden="true"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <div className="ml-4 flex-1">
                                                                <div className="h-4 bg-gray-100 w-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gray-500"
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 w-10 text-right text-karima-brand/60">({count})</div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <TabGroup>
                                    <TabList className="flex space-x-8 border-b border-karima-brand/10 mb-8">
                                        <Tab
                                            className={({ selected }) =>
                                                classNames(
                                                    "pb-3 text-sm font-medium focus:outline-none transition-all duration-300 border-b-2",
                                                    selected
                                                        ? "border-karima-brand text-karima-brand"
                                                        : "border-transparent text-karima-brand/40 hover:text-karima-brand/70 hover:border-karima-brand/20"
                                                )
                                            }
                                        >
                                            Reviews <span className="ml-1 text-[10px] align-top opacity-60 bg-karima-brand/5 px-1.5 py-0.5 rounded-full">{totalReviews}</span>
                                        </Tab>
                                    </TabList>
                                    <TabPanels>
                                        <TabPanel>
                                            {!reviews || reviews.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <StarOutlineIcon key={star} className="h-5 w-5 text-karima-brand/20" />
                                                            ))}
                                                        </div>
                                                        <p className="text-lg font-serif italic text-karima-brand/60">
                                                            Be the first to review this item
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-10">
                                                    {reviews.map((review) => (
                                                        <div
                                                            key={review.id}
                                                            className="flex flex-col space-y-4 border-b border-karima-brand/5 pb-10 last:border-0"
                                                        >
                                                            {/* Header: Name and Date */}
                                                            <div className="flex justify-between items-center text-sm">
                                                                <h4 className="font-bold text-karima-brand uppercase tracking-wide text-xs">{review.authorName}</h4>
                                                                <time
                                                                    dateTime={review.createdAt}
                                                                    className="text-karima-brand/40 text-[10px] uppercase tracking-wider"
                                                                >
                                                                    {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </time>
                                                            </div>

                                                            {/* Rating and Summary */}
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center">
                                                                    {[0, 1, 2, 3, 4].map((rating) => (
                                                                        <StarIcon
                                                                            key={rating}
                                                                            className={classNames(
                                                                                review.rating > rating
                                                                                    ? "text-karima-brand"
                                                                                    : "text-gray-200",
                                                                                "h-3.5 w-3.5 flex-shrink-0"
                                                                            )}
                                                                            aria-hidden="true"
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <h3 className="text-sm font-bold text-karima-brand">
                                                                    {review.summary}
                                                                </h3>
                                                            </div>

                                                            {/* Body */}
                                                            <div className="text-sm text-karima-ink/80 leading-relaxed font-light">
                                                                {review.body}
                                                            </div>

                                                            {/* Footer: Product Name and Share */}
                                                            <div className="pt-2 flex justify-between items-center text-[10px] text-karima-brand/40 uppercase tracking-wider">
                                                                <span>{productName}</span>
                                                                <button className="flex items-center gap-2 hover:text-karima-brand transition-colors">
                                                                    <ShareIcon className="h-3 w-3" />
                                                                    Share
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </TabPanel>
                                    </TabPanels>
                                </TabGroup>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            </div>
        </div>
    );
}
