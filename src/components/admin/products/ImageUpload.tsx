'use client';

import React, { useState, useRef } from 'react';
import { uploadFileAction } from '@/app/actions/storageActions';
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
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);
        formData.append('bucket', bucket);

        try {
            const res = await uploadFileAction(formData);
            if (res.success && res.url) {
                onChange(res.url);
            } else {
                alert(`Upload failed: ${res.message}`);
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('An unexpected error occurred during upload.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className} font-rubik`}>
            {label && <label className="text-[12.5px] font-regular text-[#242424]">{label}</label>}
            
            <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden
                    ${value ? 'border-gray-100 h-48' : 'border-gray-200 hover:border-gray-300 h-32 bg-gray-50/50'}
                    ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {value ? (
                    <>
                        <Image 
                            src={value} 
                            alt="Preview" 
                            fill 
                            className="object-cover transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[12px] font-medium px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                Change Image
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-4 py-6">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                            <PlusIcon className="w-5 h-5 text-[#71717a]" />
                        </div>
                        <div className="text-center">
                            <p className="text-[12.5px] font-regular text-zinc-400">Click to upload</p>
                            <p className="text-[11px] text-[#71717a] mt-0.5">JPG, PNG or WEBP (Max 5MB)</p>
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
