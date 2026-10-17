import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import ContactIcon from '@/components/icons/ChevronLeftIcon';
import CheckIcon from '@/components/icons/TickIcon';
import { useAuth } from '@/context/AuthContext';

interface ContactSectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  onConfirm: (data: { value: string; marketing: boolean }) => void;
  onToggle: () => void;
  initialValue?: string;
  initialMarketing?: boolean;
  externalError?: string | null;
}

export interface ContactSectionHandle {
  validateAndConfirm: () => boolean;
}

const ContactSection = forwardRef<ContactSectionHandle, ContactSectionProps>(({
  isOpen,
  isConfirmed,
  onConfirm,
  onToggle,
  initialValue = '',
  initialMarketing = true,
  externalError
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [isMarketing, setIsMarketing] = useState(initialMarketing);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const { user } = useAuth();

  // Sync with initial store data precisely
  useEffect(() => {
    if (initialValue) {
      // Remove +977 for display if it's a mobile number
      const cleanValue = initialValue.startsWith('+977 ')
        ? initialValue.replace('+977 ', '')
        : initialValue;
      setInputValue(cleanValue);
    } else if (user?.email && !inputValue) {
      setInputValue(user.email);
    }
  }, [initialValue, user]);

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
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(trimmed);
    const isPhone = /^\d{10}$/.test(trimmed);

    if (isEmail || isPhone) {
      const finalValue = isPhone ? `+977 ${trimmed}` : trimmed;
      onConfirm({ value: finalValue, marketing: isMarketing });
      setErrorMsg(null);
      return true;
    } else {
      setErrorMsg("Please enter a valid email or 10-digit phone number");
      setShakeTrigger(prev => prev + 1);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    validateAndConfirm
  }));

  return (
    <div className="w-full bg-white rounded-[20px] shadow-none overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="flex w-full justify-between items-center px-[20px] sm:px-[24px] py-[18px] sm:py-[20px] bg-white transition-colors duration-200 outline-none"
      >
        <div className="flex items-center gap-[10px] sm:gap-[12px]">
          <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-rajdhani text-[13px] font-bold shrink-0 transition-colors ${
            isConfirmed ? 'bg-[#308026] text-white' : 'bg-[#242424] text-white'
          }`}>
            {isConfirmed ? (
              <CheckIcon className="w-[12px] h-[12px] text-white" />
            ) : (
              '1'
            )}
          </div>
          <h3 className="font-rajdhani text-[18px] sm:text-[19px] font-bold leading-tight tracking-tight text-[#18181b]">
            Contact Details
          </h3>
          {isConfirmed && !isOpen && inputValue.trim() !== '' && (
            <div className="flex px-[8px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[6px]">
              <span className="font-rajdhani text-[12px] font-semibold text-[#166534] tracking-tight whitespace-nowrap">
                All set up
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <DropDownIcon className="w-[18px] h-[18px] text-[#18181b]" />
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
            <div className="w-full flex flex-col gap-[18px] px-[20px] sm:px-[24px] pb-[28px] pt-[16px] bg-white border-t border-[#f0f3ee]">
              <div className="flex flex-col gap-[10px] w-full">

                {/* Input Container */}
                <motion.div
                  key={shakeTrigger}
                  animate={errorMsg ? { x: [0, -12, 12, -12, 12, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className={`flex h-[50px] px-4 gap-[8px] items-center rounded-[12px] border transition-all duration-200 
                    ${errorMsg
                      ? 'border-[#ef4444] bg-[#fff5f5]'
                      : 'border-[#eaebf0] bg-[#f7faf6] focus-within:bg-white focus-within:border-[#308026]'
                    }`}
                >
                  <div className="flex flex-grow items-center gap-[8px]">
                    {/^\d{10}$/.test(inputValue) && (
                      <span className="font-rajdhani text-[17px] text-[#18181b] font-medium">+977</span>
                    )}
                    <input
                      type="text"
                      placeholder="Email or Mobile Phone Number"
                      value={inputValue}
                      onChange={handleInputChange}
                      className="w-full font-rajdhani text-[17px] text-[#18181b] bg-transparent placeholder:text-[#8b8e92] outline-none"
                    />
                  </div>
                  <ContactIcon className="w-[18px] h-[18px] text-[#8b8e92]" />
                </motion.div>

                <AnimatePresence>
                  {errorMsg ? (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-rajdhani text-[13px] font-medium text-[#ef4444]"
                    >
                      {errorMsg}
                    </motion.p>
                  ) : (
                    <p className="font-rajdhani text-[14px] leading-[20px] text-[#71717a]">
                      Order confirmation and shipping updates will be sent to this contact.
                    </p>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="flex items-center gap-[8px] cursor-pointer select-none"
                onClick={() => setIsMarketing(!isMarketing)}
              >
                <div className={`flex w-[18px] h-[18px] items-center justify-center rounded-[6px] transition-colors ${
                  isMarketing ? 'bg-[#308026]' : 'border border-[#eaebf0] bg-[#f7faf6]'
                }`}>
                  {isMarketing && <CheckIcon className="w-[11px] h-[11px] text-white" />}
                </div>
                <span className="font-rajdhani text-[15px] leading-[20px] text-[#4d4d4d]">
                  Email me with news and exclusive offers
                </span>
              </div>

              <button
                onClick={validateAndConfirm}
                className="flex w-full h-[48px] justify-center items-center bg-[#ffe900] hover:bg-[#f5e000] active:bg-[#ebd500] rounded-[14px] font-rajdhani text-[16px] font-bold text-[#18181b] active:scale-[0.98] transition-all outline-none"
              >
                Confirm Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;
