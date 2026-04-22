'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import ContactIcon from '@/components/icons/ChevronLeftIcon';
import CheckIcon from '@/components/icons/TickIcon';

interface ContactSectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  onConfirm: (data: { value: string; marketing: boolean }) => void;
  onToggle: () => void;
  initialValue?: string;
  initialMarketing?: boolean;
  externalError?: string | null;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  isOpen,
  isConfirmed,
  onConfirm,
  onToggle,
  initialValue = '',
  initialMarketing = true,
  externalError
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isMarketing, setIsMarketing] = useState(initialMarketing);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Sync with initial store data precisely
  useEffect(() => {
    if (initialValue) {
      // Remove +977 for display if it's a mobile number
      const cleanValue = initialValue.startsWith('+977 ') 
        ? initialValue.replace('+977 ', '') 
        : initialValue;
      setInputValue(cleanValue);
    }
  }, [initialValue]);

  useEffect(() => {
    setIsMarketing(initialMarketing);
  }, [initialMarketing]);

  useEffect(() => {
    if (externalError) {
      setErrorMsg(externalError);
      setShakeTrigger(prev => prev + 1);
    }
  }, [externalError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Only treat as phone digits if the entire input is numeric
    if (/^\d+$/.test(val)) {
      if (val.length <= 10) setInputValue(val);
    } else {
      // Allow mixed input (emails with numbers)
      setInputValue(val);
    }
    if (errorMsg) setErrorMsg(null);
  };

  const validateAndConfirm = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setErrorMsg("Please enter your email or phone number");
      setShakeTrigger(prev => prev + 1);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(trimmed);
    const isPhone = /^\d{10}$/.test(trimmed);

    if (isEmail || isPhone) {
      const finalValue = isPhone ? `+977 ${trimmed}` : trimmed;
      onConfirm({ value: finalValue, marketing: isMarketing });
      setErrorMsg(null);
    } else {
      setErrorMsg("Please enter a valid email or 10-digit phone number");
      setShakeTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="main-container mx-auto flex w-full max-w-[410px] flex-col justify-center items-center bg-white border-t border-[#f1f5f9] lg:max-w-none">
      <button
        onClick={onToggle}
        className={`flex w-full justify-between items-center px-[24px] transition-colors duration-300 ${isOpen ? 'bg-[#fafafb] py-[24px] pb-[16px]' : 'bg-white py-[24px]'
          }`}
      >
        <div className="flex items-center gap-[12px]">
          <h3 className="font-titillium text-[20px] font-semibold leading-[30px] tracking-[-0.8px] text-[#242424]">
            Contact Details
          </h3>
          {isConfirmed && !isOpen && inputValue.trim() !== '' && (
            <div className="flex p-[2px_6px] justify-center items-center bg-[#eaffcc] rounded-[4px]">
              <span className="font-titillium text-[12px] leading-[12px] text-[#575757] tracking-[-0.48px] whitespace-nowrap">
                All set up
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <DropDownIcon className="w-[18px] h-[18px] text-[#242424]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-[20px] px-[24px] pb-[32px] pt-[24px] bg-white rounded-[24px_24px_0_0] border-t border-[#f1f5f9]">
              <div className="flex flex-col gap-[10px] w-full">

                {/* Input Container with Enhanced "Hard" Shake Animation */}
                <motion.div
                  key={shakeTrigger}
                  animate={errorMsg ? { x: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className={`flex h-[50px] p-[12px] gap-[8px] items-center bg-white rounded-[8px] border transition-all duration-200 
                    ${errorMsg
                      ? 'border-[#e11717] bg-[#fff5f5]'
                      : 'border-[#eaebf0] focus-within:border-[#242424] focus-within:shadow-[0_0_0_0.5px_#242424]'
                    }`}
                >
                  <div className="flex flex-grow items-center gap-[8px]">
                    {/^\d{10}$/.test(inputValue) && (
                      <span className="font-titillium text-[18px] text-[#242424] font-medium">+977</span>
                    )}
                    <input
                      type="text"
                      placeholder="Email or Mobile Phone No"
                      value={inputValue}
                      onChange={handleInputChange}
                      className="w-full font-titillium text-[18px] text-[#242424] bg-transparent placeholder:text-[#68727d] outline-none"
                    />
                  </div>
                  <ContactIcon className="w-[20px] h-[20px] text-[#68727d]" />
                </motion.div>

                <AnimatePresence>
                  {errorMsg ? (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-titillium text-[13px] font-medium text-[#e11717]"
                    >
                      {errorMsg}
                    </motion.p>
                  ) : (
                    <p className="font-titillium text-[14px] leading-[22px] text-[#68727d]">
                      Order Details and confirmation will be shared to this email address.
                    </p>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="flex items-center gap-[6px] cursor-pointer select-none"
                onClick={() => setIsMarketing(!isMarketing)}
              >
                <div className={`flex w-[16px] h-[16px] items-center justify-center rounded-[6px] transition-colors ${isMarketing ? 'bg-[#308026]' : 'border border-[#eaebf0]'
                  }`}>
                  {isMarketing && <CheckIcon className="w-[10px] h-[10px] text-white" />}
                </div>
                <span className="font-titillium text-[16px] leading-[22px] text-[#4d4d4d]">
                  Email me with news and offers
                </span>
              </div>

              <button
                onClick={validateAndConfirm}
                className="flex w-full h-[48px] justify-center items-center bg-[#ffe900] active:bg-[#f5e000] rounded-[12px] active:scale-[0.98] transition-all"
              >
                <span className="font-titillium text-[16px] font-semibold leading-[24px] text-[#242424] tracking-[-0.2px]">
                  Confirm Details
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactSection;