"use client"

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ArrowRightIcon from '@/components/icons/RightBackIcon';
import EditIcon from '@/components/icons/EditIcon';
import UserIcon from '@/components/icons/AccountIcon';
import CalendarIcon from '@/components/icons/ChangeIcon';
import DropDownIcon from '@/components/icons/DropDownIcon';
import { updateProfile, uploadAvatar } from '@/app/actions/profile';
import { useToast } from '@/components/ui/ToastProvider';

const PROFESSIONS = ["Bodybuilder", "Athlete", "Fitness Trainer", "Nutritionist", "Student", "Other"];

interface ProfileEditFormProps {
    initialData: {
        full_name: string | null;
        phone: string | null;
        profession: string | null;
        dob: string | null;
        email: string | null;
        avatar_url?: string | null;
    }
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ initialData }) => {
    // Form States
    const [formData, setFormData] = useState({
        name: initialData.full_name || '',
        contact: initialData.phone || '+977 ',
        profession: initialData.profession || '',
        dob: initialData.dob || ''
    });

    // UI States
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProfOpen, setIsProfOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData.avatar_url || null);
    const { showToast } = useToast();

    // Sync preview with data from server when it changes (e.g. after revalidatePath)
    useEffect(() => {
        if (initialData.avatar_url) {
            setPreviewUrl(initialData.avatar_url);
        }
    }, [initialData.avatar_url]);
    
    const dateInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handler: Profile Picture Upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local Preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload to Storage
        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const result = await uploadAvatar(uploadData);
            if (result.success && result.url) {
                setPreviewUrl(result.url);
                showToast("Profile picture updated!", "success");
            } else {
                showToast(result.error || "Failed to upload image", "error");
            }
        } catch (error) {
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handler: Contact Number with +977 restriction
    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Ensure +977 is always there
        if (!value.startsWith('+977 ')) {
            value = '+977 ';
        }

        // Only allow numbers after the country code
        const numberPart = value.slice(5).replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, contact: `+977 ${numberPart}` });
    };

    // Handler: Validation & Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveStatus('idle');
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "Name is required";
        // Validation for profession and dob are no longer required as per user instruction
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setIsSaving(true);
            try {
                const result = await updateProfile({
                    name: formData.name,
                    phone: formData.contact,
                    profession: formData.profession,
                    dob: formData.dob
                });

                if (result.success) {
                    setSaveStatus('success');
                    showToast("Profile updated successfully!", "success");
                    // Reset status after 3 seconds
                    setTimeout(() => setSaveStatus('idle'), 3000);
                } else {
                    setSaveStatus('error');
                    showToast(result.error || "Failed to update profile", "error");
                    setErrors({ submit: result.error || 'Failed to update profile' });
                }
            } catch (error) {
                console.error("Save error:", error);
                setSaveStatus('error');
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col w-full bg-white">

            {/* AVATAR SECTION */}
            <div className="flex flex-col gap-[12px] items-center self-stretch shrink-0 pb-[12px]">
                <div className="relative w-[80px] h-[80px] rounded-full overflow-hidden shrink-0 border-2 border-[#3f9633]">
                    <Image 
                        src={previewUrl || "/images/avatar.png"} 
                        alt="Profile" 
                        fill 
                        className="object-cover" 
                    />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                
                {/* Hidden File Input */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                />

                <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center justify-center gap-[4px] px-[10px] py-[4px] bg-white border border-[#e2e8f0] rounded-[100px] active:scale-95 transition-transform disabled:opacity-50"
                >
                    <EditIcon className="w-[15px] h-[15px] text-[#242424]" />
                    <span className="font-titillium text-[16px] font-[600] leading-[26px] tracking-[-0.03px] text-[#242424]">
                        {isUploading ? "Uploading..." : "Edit picture"}
                    </span>
                </button>
            </div>

            {/* NAME FIELD */}
            <div className="flex flex-col gap-[8px] px-[24px] pt-[12px] lg:px-0">
                <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#252525]">Name</span>
                <div className={`flex h-[48px] items-center gap-[8px] px-[12px] py-[12px] border ${errors.name ? 'border-red-500' : 'border-[#eaebf0]'} rounded-[12px] overflow-hidden focus-within:border-[1.5px] focus-within:border-[#3f9633]`}>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="flex-1 font-titillium text-[16px] font-[400] text-[#242424] outline-none"
                    />
                </div>
                {errors.name && <span className="font-titillium text-[13px] font-[400] leading-[18px] text-red-500">{errors.name}</span>}
            </div>

            {/* EMAIL FIELD (READ ONLY) */}
            <div className="flex flex-col gap-[8px] px-[24px] pt-[24px] lg:px-0 opacity-70">
                <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#252525]">Email Address</span>
                <div className="flex h-[48px] items-center gap-[8px] p-[12px_6px_12px_12px] border border-[#eaebf0] rounded-[12px] overflow-hidden bg-gray-50">
                    <input type="email" disabled value={initialData.email || ''} className="flex-1 font-titillium text-[16px] font-[400] text-[#242424] bg-transparent outline-none cursor-not-allowed" />
                    <button type="button" className="flex w-[86px] h-[34px] items-center justify-center bg-[#eaffcc] rounded-[6px] active:scale-95 transition-all">
                        <span className="font-titillium text-[12px] font-[600] leading-[22px] text-[#3f9633]">Verified</span>
                    </button>
                </div>
            </div>

            {/* CONTACT DETAILS */}
            <div className="flex flex-col gap-[8px] px-[24px] pt-[24px] lg:px-0">
                <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#252525]">Contact Details</span>
                <div className={`flex h-[48px] items-center gap-[8px] px-[12px] py-[12px] border ${errors.contact ? 'border-red-500' : 'border-[#eaebf0]'} rounded-[12px] overflow-hidden focus-within:border-[1.5px] focus-within:border-[#3f9633]`}>
                    <input
                        type="text"
                        value={formData.contact}
                        onChange={handleContactChange}
                        className="flex-1 font-titillium text-[16px] font-semibold text-[#242424] outline-none"
                    />
                    <UserIcon className="w-[20px] h-[20px] text-[#68727d]" />
                </div>
                {errors.contact && <span className="font-titillium text-[13px] font-[400] leading-[18px] text-red-500">{errors.contact}</span>}
            </div>

            {/* PROFESSION & DOB GROUP */}
            <div className="flex gap-[12px] px-[24px] pt-[24px] lg:px-0">
                {/* PROFESSION DROPDOWN */}
                <div className="relative flex flex-1 flex-col gap-[8px]">
                    <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#252525]">Profession</span>
                    <div
                        onClick={() => setIsProfOpen(!isProfOpen)}
                        className={`flex h-[48px] items-center justify-between px-[16px] py-[12px] border ${errors.profession ? 'border-red-500' : 'border-[#eaebf0]'} rounded-[12px] cursor-pointer bg-white transition-all ${isProfOpen ? 'border-[1.5px] border-[#3f9633]' : ''}`}
                    >
                        <span className={`font-titillium text-[16px] font-[400] truncate ${formData.profession ? 'text-[#252525]' : 'text-[#68727d]'}`}>
                            {formData.profession || "Select"}
                        </span>
                        <motion.div animate={{ rotate: isProfOpen ? 180 : 0 }}>
                            <DropDownIcon className="w-[20px] h-[20px] text-[#242424]" />
                        </motion.div>
                    </div>

                    <AnimatePresence>
                        {isProfOpen && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="absolute top-[80px] left-0 w-full z-50 bg-white border border-[#eaebf0] rounded-[12px] shadow-xl overflow-hidden"
                            >
                                {PROFESSIONS.map((p) => (
                                    <li
                                        key={p}
                                        onClick={() => { setFormData({ ...formData, profession: p }); setIsProfOpen(false); setErrors({ ...errors, profession: '' }); }}
                                        className="px-[16px] py-[12px] font-titillium text-[14px] text-[#252525] hover:bg-[#f7faf6] cursor-pointer"
                                    >
                                        {p}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                    {errors.profession && <span className="font-titillium text-[13px] text-red-500">{errors.profession}</span>}
                </div>

                {/* DATE OF BIRTH */}
                <div className="flex flex-1 flex-col gap-[8px]">
                    <span className="font-titillium text-[14px] font-[600] leading-[20px] text-[#252525]">Date of Birth</span>
                    <div
                        onClick={() => dateInputRef.current?.showPicker()}
                        className={`flex h-[48px] items-center justify-between px-[16px] py-[12px] border ${errors.dob ? 'border-red-500' : 'border-[#eaebf0]'} rounded-[12px] cursor-pointer bg-white focus-within:border-[1.5px] focus-within:border-[#3f9633]`}
                    >
                        <span className={`font-titillium text-[16px] font-[400] ${formData.dob ? 'text-[#252525]' : 'text-[#68727d]'}`}>
                            {formData.dob || "Select"}
                        </span>
                        <CalendarIcon className="w-[20px] h-[20px] text-[#242424]" />
                        <input
                            ref={dateInputRef}
                            type="date"
                            className="absolute opacity-0 pointer-events-none"
                            onChange={(e) => { setFormData({ ...formData, dob: e.target.value }); setErrors({ ...errors, dob: '' }); }}
                        />
                    </div>
                    {errors.dob && <span className="font-titillium text-[13px] text-red-500">{errors.dob}</span>}
                </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="px-[24px] pt-[32px] lg:px-0">
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`flex w-full h-[48px] items-center justify-center rounded-[12px] active:scale-[0.98] transition-all ${
                        saveStatus === 'success' ? 'bg-[#3f9633] text-white' : 
                        saveStatus === 'error' ? 'bg-red-500 text-white' : 
                        'bg-[#ffe900] text-[#242424]'
                    } ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    <span className="font-titillium text-[16px] font-[600] leading-[24px] tracking-[-0.2px]">
                        {isSaving ? 'Saving...' : 
                         saveStatus === 'success' ? 'Saved Successfully!' : 
                         saveStatus === 'error' ? 'Error Saving' : 
                         'Save Changes'}
                    </span>
                </button>
                {errors.submit && <p className="mt-2 text-center text-red-500 text-sm">{errors.submit}</p>}
            </div>
        </form>
    );
};

export default ProfileEditForm;