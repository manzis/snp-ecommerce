'use client';

import React, { useState, useRef } from 'react';
import { uploadFileAction } from '@/app/actions/storageActions';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiImageUploadProps {
    images: string[];
    onChange: (urls: string[]) => void;
    path?: string;
    bucket?: string;
    maxImages?: number;
}

export default function MultiImageUpload({
    images = [],
    onChange,
    path = 'products',
    bucket = 'snp-storage',
    maxImages = 6
}: MultiImageUploadProps) {
    const [uploadingIndices, setUploadingIndices] = useState<number[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragStart = (idx: number) => setDraggedIndex(idx);
    
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault(); // Necessary to allow dropping
    };
    
    const handleDrop = (idx: number) => {
        if (draggedIndex === null || draggedIndex === idx) return;
        const newImages = [...images];
        const draggedItem = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(idx, 0, draggedItem);
        onChange(newImages);
        setDraggedIndex(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Calculate how many more images we can add
        const remainingSlots = maxImages - images.length;
        const filesToUpload = files.slice(0, remainingSlots);

        if (files.length > remainingSlots) {
            alert(`You can only add ${remainingSlots} more image(s). Max limit is ${maxImages}.`);
        }

        const newUploadingIndices: number[] = [];
        const currentLength = images.length;

        // Optimistically show uploading state
        for (let i = 0; i < filesToUpload.length; i++) {
            newUploadingIndices.push(currentLength + i);
        }
        setUploadingIndices(prev => [...prev, ...newUploadingIndices]);

        const uploadPromises = filesToUpload.map(async (file, index) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', path);
            formData.append('bucket', bucket);

            try {
                const res = await uploadFileAction(formData);
                if (res.success && res.url) {
                    return res.url;
                } else {
                    console.error(`Upload failed for file ${index}:`, res.message);
                    return null;
                }
            } catch (error) {
                console.error(`Error uploading file ${index}:`, error);
                return null;
            }
        });

        const urls = await Promise.all(uploadPromises);
        const successfulUrls = urls.filter((url): url is string => url !== null);

        onChange([...images, ...successfulUrls]);
        setUploadingIndices(prev => prev.filter(idx => !newUploadingIndices.includes(idx)));

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    const setMainImage = (index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        const selectedImage = newImages[index];
        // Remove from current position and insert at front
        newImages.splice(index, 1);
        newImages.unshift(selectedImage);
        onChange(newImages);
    };

    return (
        <div className="space-y-6 font-rubik">
            {/* Preview Section */}
            {(images.length > 0 || uploadingIndices.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h4 className="text-[13px] font-medium text-[#242424]">Uploaded images</h4>
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md font-medium uppercase tracking-wider">Drag to reorder</span>
                        </div>
                        <span className="text-[11px] text-[#71717a] font-regular">{images.length}/{maxImages} Images</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <AnimatePresence mode="popLayout">
                            {images.map((url, index) => (
                                <motion.div 
                                    key={url}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={() => handleDrop(index)}
                                    className={`relative aspect-square group rounded-xl overflow-hidden border ${index === 0 ? 'border-[#308026] ring-2 ring-[#308026]/10' : 'border-gray-100'} bg-gray-50 cursor-grab active:cursor-grabbing`}
                                >
                                    <Image 
                                        src={url} 
                                        alt={`Product ${index + 1}`}
                                        fill 
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />

                                    {/* Main Image Badge */}
                                    {index === 0 && (
                                        <div className="absolute top-2 left-2 z-10">
                                            <span className="px-2 py-1 bg-[#308026] text-white text-[9px] font-bold rounded-md shadow-sm uppercase tracking-tight">Main</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay for actions */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                        {index !== 0 ? (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMainImage(index);
                                                }}
                                                className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[11px] font-medium border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 active:scale-95"
                                            >
                                                <SwapIcon className="w-3.5 h-3.5" />
                                                Set as Main
                                            </button>
                                        ) : (
                                            <span className="text-white text-[11px] font-medium bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30">Primary Image</span>
                                        )}
                                    </div>
                                    
                                    {/* Quick remove button (top right) */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage(index);
                                        }}
                                        className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 hover:bg-white transition-all scale-75 group-hover:scale-100"
                                    >
                                        <CrossIcon className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            ))}

                            {/* Uploading placeholders */}
                            {uploadingIndices.map((idx) => (
                                <div key={`uploading-${idx}`} className="relative aspect-square rounded-xl bg-gray-100 border border-gray-200 border-dashed flex flex-col items-center justify-center gap-2 overflow-hidden animate-pulse">
                                    <div className="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin" />
                                    <span className="text-[10px] font-medium text-black/40 px-2 text-center">Uploading...</span>
                                </div>
                            ))}
                        </AnimatePresence>

                        {/* Direct "Add" slot if we have space and images */}
                        {images.length > 0 && images.length < maxImages && (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-[#242424] hover:text-white transition-all flex flex-col items-center justify-center gap-1 group/add"
                            >
                                <span className="text-[11px] font-medium group-hover/add:underline underline-offset-2">Browse file</span>
                                <span className="text-[9px] font-regular opacity-60">{maxImages - images.length} left</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            {images.length < maxImages && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-black rounded-2xl transition-all flex flex-col items-center justify-center p-8 bg-gray-50/50 hover:bg-white"
                >
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    
                    <div className="flex flex-col items-center gap-3">
                        <CloudIcon className="w-8 h-8 text-[#a1a1aa] mb-1" />
                        <div className="text-center">
                            <p className="text-[14px] font-medium text-[#242424]">Click to upload product images</p>
                            <p className="text-[12px] text-[#71717a] mt-1">Select up to {maxImages - images.length} more images (JPG, PNG or WEBP)</p>
                            <button 
                                className="mt-4 px-6 py-2 bg-white border border-gray-200 text-[#242424] text-[12px] font-medium rounded-full hover:bg-[#242424] hover:text-white hover:border-[#242424] transition-all"
                            >
                                Browse file
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}

function CrossIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

function SwapIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
    );
}

function CloudIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
        </svg>
    );
}
