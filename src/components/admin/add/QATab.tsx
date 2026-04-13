import React from 'react';
import PlusIcon from '@/components/icons/PlusIcon';

export default function QATab({ formData, setFormData }: any) {
    const addQA = () => {
        setFormData({
            ...formData,
            qa: [...formData.qa, { question: '', answer: '' }]
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-[15px] font-medium text-[#242424]">Product Assistance</h3>
                    <p className="text-[12px] text-[#a1a1aa] font-regular">Common questions and pre-set answers</p>
                </div>
                <button
                    onClick={addQA}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-[#242424] text-[12px] font-medium rounded-full hover:bg-gray-100 transition-all border border-gray-100/50"
                >
                    <PlusIcon className="w-4 h-4" />
                    <span>New Pair</span>
                </button>
            </div>

            <div className="space-y-4">
                {(!formData.qa || formData.qa.length === 0) ? (
                    <div className="py-20 bg-gray-50/30 rounded-3xl border border-gray-100 border-dashed flex flex-col items-center justify-center text-center">
                        <p className="text-[13px] text-[#a1a1aa] font-regular">Frequently asked questions appear here</p>
                    </div>
                ) : (
                    (formData.qa || []).map((item: any, index: number) => (
                        <div key={index} className="p-6 bg-white border border-gray-100 rounded-2xl flex flex-col gap-4">
                            <div className="flex-1">
                                <label className="text-[10px] text-[#71717a] font-regular uppercase tracking-wider mb-1 block">Question</label>
                                <input
                                    type="text"
                                    value={item.question}
                                    placeholder="e.g. Is this gluten free?"
                                    onChange={(e) => {
                                        const updated = [...formData.qa];
                                        updated[index].question = e.target.value;
                                        setFormData({ ...formData, qa: updated });
                                    }}
                                    className="w-full bg-gray-50 border border-transparent rounded-lg px-4 py-3 text-[14px] font-medium placeholder:font-regular focus:bg-white focus:border-gray-200 outline-none transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] text-[#71717a] font-regular uppercase tracking-wider mb-1 block">Answer</label>
                                <textarea
                                    value={item.answer}
                                    placeholder="Enter response..."
                                    onChange={(e) => {
                                        const updated = [...formData.qa];
                                        updated[index].answer = e.target.value;
                                        setFormData({ ...formData, qa: updated });
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
