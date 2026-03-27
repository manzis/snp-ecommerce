'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, mode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* OVERLAY */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
          />

          {/* PANEL */}
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col w-full bg-white rounded-t-[24px] overflow-hidden"
            style={{ height: mode === 'add' ? '65%' : '50%' }}
          >
            {/* CLOSE HANDLE */}
            <div className="flex justify-center p-[16px]">
              <button 
                onClick={onClose}
                className="w-[40px] h-[5px] bg-[#eaebf0] rounded-full"
              />
            </div>

            <div className="flex flex-col gap-[20px] px-[24px] pb-[32px]">
              <h2 className="font-titillium text-[20px] font-bold text-[#242424]">
                {mode === 'add' ? 'Add New Address' : 'Edit Address'}
              </h2>
              
              {/* FORM FIELDS (Demo placeholders) */}
              <div className="flex flex-col gap-[12px]">
                {['Full Name', 'City/Area', 'Detailed Address', 'Phone Number'].map((field) => (
                  <input 
                    key={field}
                    type="text"
                    placeholder={field}
                    className="w-full h-[50px] px-[16px] border border-[#eaebf0] rounded-[8px] font-titillium outline-none focus:border-[#242424]"
                  />
                ))}
              </div>

              {/* ADDRESS TYPE */}
              <div className="flex gap-[12px]">
                {['Home', 'Work', 'Other'].map((type) => (
                  <button key={type} className="flex-1 py-[10px] border border-[#eaebf0] rounded-[8px] font-titillium text-[14px]">
                    {type}
                  </button>
                ))}
              </div>

              <button 
                className="w-full h-[52px] bg-[#ffe900] rounded-[12px] font-titillium font-bold text-[16px] mt-4"
                onClick={onClose}
              >
                Save Address
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddressModal;