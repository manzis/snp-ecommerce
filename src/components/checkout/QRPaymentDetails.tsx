'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import UploadIcon from '@/components/icons/UploadIcon';
import EyeIcon from '@/components/icons/EyeIcon';
import SaveIcon from '@/components/icons/Wishlisht';

interface QrPaymentDetailsProps {
  onVerify: (data: { file: File | null; remarks: string }) => void;
  onChange?: (data: { file: File | null; remarks: string }) => void;
  initialFile?: File | null;
  initialRemarks?: string;
  hasError?: boolean;
}

const QrPaymentDetails: React.FC<QrPaymentDetailsProps> = ({
  onVerify,
  onChange,
  initialFile = null,
  initialRemarks = 'Shopping Payment',
  hasError = false
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [remarks, setRemarks] = useState(initialRemarks);
  const [selectedFile, setSelectedFile] = useState<File | null>(initialFile);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Timer Logic - Starts ONLY when isRevealed is true

  // GRADIENT TOKENS
  const activeGradient = 'linear-gradient(30deg, #FCFFFA 60%, #edffd3ff 100%)';
  const inactiveGradient = 'linear-gradient(45deg, #FDFFFA 50%, #fafff3 100%)';
  const borderGradient = 'linear-gradient(30deg, #3F9733 10%, #8aaf85 30%, #E8F3E4 80%, #E8F3E4 100%)';

  useEffect(() => {
    if (!isRevealed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRevealed, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      if (onChange) onChange({ file, remarks });
    }
  };

  useEffect(() => {
    if (onChange) onChange({ file: selectedFile, remarks });
  }, [remarks]);

  const handleVerify = () => {
    if (!selectedFile) {
      setError("Please upload the payment receipt first.");
      return;
    }
    onVerify({ file: selectedFile, remarks });
  };

  return (
    <div className="flex w-full flex-col gap-[24px] items-center transition-all duration-300 pt-[4px]" >

      {/* Main QR Container (Outer Stroke - Full Width) */}
      <div className="w-full border-[1.5px] border-[#eaebf0] rounded-[12px]  overflow-hidden " style={{ background: isRevealed ? activeGradient : inactiveGradient }}>

        {/* TIMER SECTION AT TOP (With Gradient Fill) */}
        <div
          className="w-full transition-all duration-500 "

        >
          <AnimatePresence mode="wait">
            {isRevealed ? (
              <motion.div
                key="timer-active"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="w-full flex flex-col items-center py-[16px] gap-[3px]"
              >
                <span className="font-titillium text-[12px] uppercase tracking-[2px] text-[#838383] font-semibold">
                  Session expires in
                </span>
                <span className="font-custom text-[24px] text-[#308026] leading-none mt-1">
                  {formatTime(timeLeft)}
                </span>
              </motion.div>
            ) : (
              <div className="w-full flex flex-col items-center py-[14px]">
                <span className="font-titillium text-[13px] text-[#838383] font-medium">
                  QR Code valid for 15 minutes
                </span>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* QR CODE CONTENT AREA */}
        <div className="relative w-full aspect-square pt-[24px] pb-[16px] flex items-center justify-center overflow-hidden bg-white border-t  border-[#eaebf0] ">
          {/* QR Image */}
          <div className={`relative w-full h-full transition-all duration-1000 ease-out ${!isRevealed ? 'blur-[20px] scale-90 opacity-30' : 'blur-0 scale-100 opacity-100'}`}>
            <Image
              src="/images/payments/qr.png"
              alt="Payment QR"
              fill
              className="object-contain"
              sizes="(max-width: 412px) 100vw, 350px"
            />
          </div>

          {/* Show QR Button - DEAD CENTER */}
          {!isRevealed && (
            <button
              onClick={() => setIsRevealed(true)}
              className="absolute z-10 flex items-center gap-[10px] p-[16px_20px] border border-[#eaebf0] rounded-[12px] bg-white shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-transform"
            >
              <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Show QR</span>
              <EyeIcon className="w-[18px] h-[18px] text-[#6a6c6e]" />
            </button>
          )}

          {/* Save QR Button - BOTTOM CENTER */}
          <AnimatePresence>
            {isRevealed && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => console.log("Save QR")}
                className="absolute top-[10px] right-[12px] z-10 flex items-center gap-[10px] p-[6px_12px] border border-[#eaebf0] bg-white opacity-[80%] rounded-[100px]  shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] active:scale-95 transition-transform"
              >
                <span className="font-titillium text-[14px] font-semibold text-[#6a6c6e]">Save</span>
                <SaveIcon className="w-[18px] h-[18px] text-[#6a6c6e]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Section (Dashed) */}
      <div className="flex flex-col w-full gap-[8px]">
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`flex w-full h-[56px] items-center justify-between px-[16px] rounded-[12px] border-[1.5px] border-dashed transition-all duration-200 ${selectedFile
              ? 'border-[#308026] bg-[#f7faf6]'
              : (hasError || (!!error && !selectedFile))
                ? 'border-[#e11717] bg-[#fff5f5]'
                : 'border-[#e2e8f0] bg-white'
            }`}
        >
          <div className="flex items-center gap-[10px] overflow-hidden">
            <UploadIcon className="w-[18px] h-[18px] text-[#68727d] rotate-180" />
            <span className="font-titillium text-[15px] text-[#242424] truncate max-w-[200px]">
              {selectedFile ? selectedFile.name : 'Upload Payment Receipt'}
            </span>
          </div>
          <span className="font-titillium text-[13px] font-semibold text-[#308026]">
            {selectedFile ? 'Change' : 'Browse'}
          </span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf"
        />
        <div className="flex justify-between items-center px-1">
          <p className="font-titillium text-[13px] text-[#838383]">
            Upload a statement receipt (PNG, JPG or PDF)
          </p>
          {((hasError || !!error) && !selectedFile) && (
            <span className="text-[#e11717] font-semibold text-[12px]">Please upload screenshot</span>
          )}
        </div>
      </div>

      {/* Remarks Input */}
      <div className="flex flex-col w-full gap-[8px]">
        <div className="flex h-[52px] p-[12px] items-center bg-white rounded-[8px] border-[1px] border-[#eaebf0] focus-within:border-[1.5px] focus-within:border-[#242424] transition-all">
          <input
            type="text"
            placeholder="Remarks Eg: Shopping Payment"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full font-titillium text-[16px] text-[#242424] outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Footer & Action */}
      <div className="flex flex-col w-full gap-[15px] pt-[8px]">
        <div className="flex flex-col gap-[12px]">
          <button
            onClick={handleVerify}
            type="button"
            className="flex w-full h-[52px] items-center justify-center bg-[#ffe900] active:bg-[#f5e000] rounded-[12px] transition-all active:scale-[0.98] outline-none  "
          >
            <span className="font-titillium text-[16px] font-semibold text-[#242424] tracking-[-0.2px]">
              Verify payment via QR
            </span>
          </button>

          <AnimatePresence>
            {error && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[#e11717] font-titillium text-[12px] text-center font-medium"
              >
                {error}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <p className="font-titillium text-[13px] leading-[20px] text-[#838383] text-center px-4">
          Verifying the QR payment will take 30 to 1 hour, we will update you once it is confirmed.
        </p>
      </div>
    </div>
  );
};

export default QrPaymentDetails;