import React from 'react';
import PlusIcon from '@/components/icons/PlusIcon';
import AdminDropdown from '@/components/admin/shared/AdminDropdown';

export default function ReviewsTab({ formData, setFormData }: any) {
    const addReview = () => {
        setFormData({
            ...formData,
            reviews: [...formData.reviews, { user_name: '', rating: 5, comment: '', date: new Date().toISOString() }]
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[15px] font-medium text-[#242424]">Customer Feedback</h3>
                    <p className="text-[12px] text-[#a1a1aa] font-regular">Manage curated product reviews</p>
                </div>
                <button
                    onClick={addReview}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-[#242424] text-[12px] font-medium rounded-full hover:bg-gray-100 transition-all border border-gray-100/50"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add Entry</span>
                </button>
            </div>

            <div className="space-y-4">
                {(!formData.reviews || formData.reviews.length === 0) ? (
                    <div className="py-20 bg-gray-50/30 rounded-3xl border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                        <p className="text-[13px] text-[#a1a1aa] font-regular">Curated reviews appear here</p>
                    </div>
                ) : (
                    (formData.reviews || []).map((review: any, index: number) => (
                        <div key={index} className="p-6 bg-white border border-gray-100 rounded-2xl space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] text-[#71717a] font-regular uppercase tracking-wider mb-1 block">Username</label>
                                    <input
                                        type="text"
                                        value={review.user_name}
                                        placeholder="Display Name"
                                        onChange={(e) => {
                                            const updated = [...formData.reviews];
                                            updated[index].user_name = e.target.value;
                                            setFormData({ ...formData, reviews: updated });
                                        }}
                                        className="w-full bg-gray-50 border border-transparent rounded-lg px-4 py-3 text-[14px] font-regular placeholder:font-regular focus:bg-white focus:border-gray-200 outline-none transition-all"
                                    />
                                </div>
                                <div className="w-40">
                                    <AdminDropdown
                                        label="Rating"
                                        value={review.rating.toString()}
                                        options={[5, 4, 3, 2, 1].map(r => ({
                                            id: r.toString(),
                                            name: `${r} Stars`
                                        }))}
                                        onChange={(val: string) => {
                                            const updated = [...formData.reviews];
                                            updated[index].rating = Number(val);
                                            setFormData({ ...formData, reviews: updated });
                                        }}
                                        placeholder="Rate"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-[#71717a] font-regular uppercase tracking-wider mb-1 block">Comment</label>
                                <textarea
                                    value={review.comment}
                                    placeholder="Write something..."
                                    onChange={(e) => {
                                        const updated = [...formData.reviews];
                                        updated[index].comment = e.target.value;
                                        setFormData({ ...formData, reviews: updated });
                                    }}
                                    className="w-full bg-gray-50 border border-transparent rounded-lg px-4 py-3 text-[14px] font-regular placeholder:font-regular focus:bg-white focus:border-gray-200 outline-none transition-all resize-none"
                                    rows={3}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
