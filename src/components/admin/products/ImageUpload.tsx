'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    path?: string;
    bucket?: string;
    className?: string;
}

export default function ImageUpload({
    value,
    onChange,
    label,
    path = 'products',
    bucket = 'snp-storage',
    className = ''
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // Prepare unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${path}/${fileName}`;

            // Direct client-side upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) {
                console.error('Supabase Storage Error:', uploadError);
                throw new Error(uploadError.message);
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (error: any) {
            console.error('Image upload error:', error);
            alert(`Upload failed: ${error.message || 'An unexpected error occurred'}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const isVideo = value?.match(/\.(mp4|webm|mov|ogg)$/i) || value?.includes('video');
    const isValidMedia = typeof value === 'string' && value.trim() !== '' && value !== 'undefined' && value !== 'null';

    return (
        <div className={`flex flex-col gap-2 ${className} font-rubik`}>
            {label && <label className="text-[12.5px] font-regular text-[#242424]">{label}</label>}
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden
                    ${isValidMedia ? 'border-gray-100 h-48' : 'border-gray-200 hover:border-gray-300 h-32 bg-gray-50/50'}
                    ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {isValidMedia ? (
                    <>
                        {isVideo ? (
                            <video 
                                src={value} 
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                onMouseOver={e => (e.target as HTMLVideoElement).play()}
                                onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                            />
                        ) : (
                            <Image 
                                src={value} 
                                alt="Preview" 
                                fill 
                                className="object-cover transition-transform group-hover:scale-105" 
                            />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[12px] font-medium px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                Change Media
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange('');
                            }}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Remove media"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-4 py-6">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                            <PlusIcon className="w-5 h-5 text-[#71717a]" />
                        </div>
                        <div className="text-center">
                            <p className="text-[12.5px] font-regular text-zinc-400">Click to upload</p>
                            <p className="text-[11px] text-[#71717a] mt-0.5">Image or Video (Max 50MB)</p>
                        </div>
                    </div>
                )}

                {isUploading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-[#242424]/20 border-t-[#242424] rounded-full animate-spin" />
                        <span className="text-[11px] font-medium text-[#242424]">Uploading...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );
}
