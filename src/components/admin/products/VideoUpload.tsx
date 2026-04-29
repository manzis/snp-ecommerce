'use client';

import React, { useState, useRef } from 'react';
import { deleteFileAction } from '@/app/actions/storageActions';
import { uploadFileClientSide } from '@/lib/cloudinary-client';

interface VideoUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    path?: string;
    bucket?: string;
    className?: string;
}

export default function VideoUpload({
    value,
    onChange,
    label,
    path = 'products/videos',
    bucket = 'snp-storage',
    className = ''
}: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const oldVideoUrl = value;
        setIsUploading(true);

        try {
            const res = await uploadFileClientSide(file, path);
            if (res.success && res.url) {
                onChange(res.url);

                // Cleanup old video from storage
                if (oldVideoUrl && oldVideoUrl.includes('res.cloudinary.com')) {
                    const parts = oldVideoUrl.split('/upload/');
                    if (parts.length >= 2) {
                        const afterUpload = parts[1];
                        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
                        const publicId = withoutVersion.split('.')[0];
                        if (publicId) await deleteFileAction(publicId, 'video');
                    }
                }
            } else {
                alert(`Upload failed: ${res.message}`);
            }
        } catch (error) {
            console.error('Video upload error:', error);
            alert('An unexpected error occurred during upload.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!value) return;

        const urlToRemove = value;
        onChange('');

        if (urlToRemove.includes('res.cloudinary.com')) {
            try {
                const parts = urlToRemove.split('/upload/');
                if (parts.length >= 2) {
                    const afterUpload = parts[1];
                    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
                    const publicId = withoutVersion.split('.')[0];
                    if (publicId) await deleteFileAction(publicId, 'video');
                }
            } catch (err) {
                console.error('Failed to delete video:', err);
            }
        }
    };

    return (
        <div className={`flex flex-col gap-2 ${className} font-rubik`}>
            {label && <label className="text-[12.5px] font-regular text-[#242424]">{label}</label>}
            
            <div 
                onClick={() => !value && fileInputRef.current?.click()}
                className={`relative group border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center overflow-hidden
                    ${value ? 'border-gray-100 h-48' : 'border-gray-200 cursor-pointer hover:border-gray-300 h-32 bg-gray-50/50'}
                    ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}
            >
                <input 
                    type="file" 
                    className="hidden" 
                    accept="video/mp4,video/webm,video/ogg"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />

                {value ? (
                    <>
                        <video 
                            src={value} 
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <span className="text-white text-[12px] font-medium px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors">
                                Replace Video
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100 z-10"
                            title="Remove video"
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
                            <VideoIcon className="w-5 h-5 text-[#71717a]" />
                        </div>
                        <div className="text-center">
                            <p className="text-[12.5px] font-regular text-zinc-400">Click to upload video</p>
                            <p className="text-[11px] text-[#71717a] mt-0.5">MP4, WEBM (Max 50MB)</p>
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

function VideoIcon({ className }: { className?: string }) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
    );
}
