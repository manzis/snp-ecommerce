'use client';

import React, { useState, useEffect, useMemo } from 'react';
import PlusIcon from '@/components/icons/PlusIcon';
import { ReviewCard } from '@/components/admin/reviews/ReviewCard';
import ReviewModal from '@/components/admin/reviews/ReviewModal';
import { fetchReviewsAction } from '@/app/actions/reviewActions';
import { CardGridSkeleton } from '@/components/admin/shared/AdminPageSkeletons';

export default function ReviewsTab({ formData, setFormData }: any) {
    const [allReviews, setAllReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const productId = formData.id;

    const loadReviews = async () => {
        setIsLoading(true);
        const res = await fetchReviewsAction();
        if (res.success) {
            setAllReviews(res.reviews || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const filteredReviews = useMemo(() => {
        return allReviews.filter(r => 
            r.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.products?.title || r.products?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allReviews, searchQuery]);

    // Track which reviews are "locally" linked to this product in the form
    // We'll use the author + text as a unique key for matching if they are new,
    // or we can add a 'linked_from_id' to the objects in formData.reviews
    const isReviewLinked = (review: any) => {
        return (formData.reviews || []).some((r: any) => 
            r.linked_from_id === review.id || (r.author === review.author && r.text === review.text)
        );
    };

    const handleAddEntry = () => {
        setIsModalOpen(true);
    };

    const handleSaveNewReview = async (id: string | null, data: Partial<any>, productIds: string[]) => {
        // Instead of calling createReviewAction, we just add it to formData.reviews
        // This review will be saved when the entire product form is saved
        setFormData({
            ...formData,
            reviews: [
                ...(formData.reviews || []),
                {
                    ...data,
                    is_new: true,
                    created_at: new Date().toISOString()
                }
            ]
        });
        setIsModalOpen(false);
    };

    const handleToggleLink = (review: any) => {
        const currentlyLinked = isReviewLinked(review);
        
        if (currentlyLinked) {
            // Remove from local formData.reviews
            setFormData({
                ...formData,
                reviews: (formData.reviews || []).filter((r: any) => 
                    r.linked_from_id !== review.id && !(r.author === review.author && r.text === review.text)
                )
            });
        } else {
            // Add to local formData.reviews (Duplicate/Link)
            const { id, created_at, products, product_id, ...dataToCopy } = review;
            setFormData({
                ...formData,
                reviews: [
                    ...(formData.reviews || []),
                    {
                        ...dataToCopy,
                        linked_from_id: review.id,
                        is_verified: true
                    }
                ]
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[15px] font-medium text-[#242424]">Review Management</h3>
                        <p className="text-[12px] text-[#a1a1aa] font-regular">Curate and link reviews for this product</p>
                    </div>
                    <button
                        onClick={handleAddEntry}
                        className="flex items-center gap-2 px-6 py-2 bg-[#242424] text-white text-[13px] font-medium rounded-full hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/5"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add New Review</span>
                    </button>
                </div>

                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder="Search existing reviews..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-full px-10 py-2.5 text-[13px] outline-none focus:bg-white focus:border-black transition-all"
                    />
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                </div>
            </div>

            {/* Content section */}
            <div className="space-y-8">
                {isLoading ? (
                    <CardGridSkeleton count={6} />
                ) : (
                    <>
                        {/* Currently Added Reviews in this form */}
                        {(formData.reviews || []).length > 0 && (
                            <div className="space-y-4">
                                <h4 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">Added for this product (Pending Save)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(formData.reviews || []).map((review: any, idx: number) => (
                                        <ReviewCard
                                            key={idx}
                                            review={review}
                                            showCheckbox={true}
                                            isSelected={true}
                                            onToggleAction={() => {
                                                setFormData({
                                                    ...formData,
                                                    reviews: formData.reviews.filter((_: any, i: number) => i !== idx)
                                                });
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Browse Existing to Link */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider">
                                {searchQuery ? 'Search Results' : 'Browse All Existing Reviews'}
                            </h4>
                            {filteredReviews.length === 0 ? (
                                <div className="py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                                    <p className="text-[13px] text-[#a1a1aa] font-regular italic">No reviews found matching your search</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredReviews
                                        .filter(r => !isReviewLinked(r)) // Only show ones not already added
                                        .map((review) => (
                                            <ReviewCard
                                                key={review.id}
                                                review={review}
                                                showCheckbox={true}
                                                isSelected={false}
                                                onToggleAction={() => handleToggleLink(review)}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Defer Save: Modal now just updates local state */}
            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveNewReview}
                lockProduct={true}
                initialProductIds={useMemo(() => productId ? [productId] : [], [productId])}
                isSaving={false} // Saving is deferred
            />
        </div>
    );
}
