'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import AddressSelector from './AddressSelector';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import AddressModal from './AddressModal';

interface Address {
  id: string;
  name: string;
  addressLine: string;
  email: string;
  phone: string;
  type: 'Home' | 'Work' | 'Other';
}

interface DeliverySectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  disabled?: boolean;
  onConfirm: (address: Address, option: string) => void;
  onToggle: () => void;
}

const MOCK_ADDRESSES: Address[] = [
  { id: '1', name: "Manjish Upadhaya", addressLine: "Kathmandu, Baneshwor, Putali Sadak", email: "manjishupdahaya@gmail.com", phone: "+977 9807553740", type: 'Home' },
  { id: '2', name: "Manjish Upadhaya", addressLine: "Kathmandu, Baneshwor, Putali Sadak", email: "manjishupdahaya@gmail.com", phone: "+977 9807553740", type: 'Work' }
];

const DELIVERY_METHODS = [
  { id: 'home', title: 'Home Delivery', price: 'NPR 150', desc: 'Deliver the parcel to home address, Doorstep' },
  { id: 'pickup', title: 'Pickup', price: 'NPR 100', desc: 'Pickup from the nearest station' }
];

const DeliverySection: React.FC<DeliverySectionProps> = ({
  isOpen,
  isConfirmed,
  disabled = false,
  onConfirm,
  onToggle,
}) => {
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [deliveryOption, setDeliveryOption] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const handleConfirm = () => {
    const addr = MOCK_ADDRESSES.find(a => a.id === selectedAddressId);
    if (addr) onConfirm(addr, deliveryOption);
  };

  return (
    <div className={`main-container mx-auto flex w-full max-w-[412px] flex-col items-start bg-white border-t border-[#f1f5f9] lg:max-w-none transition-all duration-300 ${
      disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
    }`}>
      {/* ACCORDION HEADER */}
      <button 
        onClick={onToggle}
        disabled={disabled}
        className={`flex w-full justify-between items-center px-[24px] transition-colors duration-300 ${
          isOpen ? 'bg-[#fafbfb] py-[24px]' : 'bg-white py-[24px]'
        }`}
      >
        <div className="flex items-center gap-[12px]">
          <h1 className="font-titillium text-[20px] font-semibold leading-[30px] tracking-[-0.8px] text-[#242424]">
            Delivery Details
          </h1>
          {isConfirmed && !isOpen && !disabled && (
            <div className="flex px-[6px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[4px]">
              <span className="font-titillium text-[12px] leading-[12px] text-[#575757] tracking-[-0.48px]">
                Details Added
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <DropDownIcon className="w-[18px] h-[18px] text-[#242424]" />
        </motion.div>
      </button>

      {/* ACCORDION CONTENT */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="flex flex-col gap-[24px] px-[24px] pb-[32px] pt-[24px] bg-white rounded-[24px_24px_0_0] border-b border-[#f1f5f9]">
              
              <AddressSelector 
                addresses={MOCK_ADDRESSES}
                selectedId={selectedAddressId}
                onSelect={setSelectedAddressId}
                onEdit={(id) => { setModalMode('edit'); setIsModalOpen(true); }}
                onAddNew={() => { setModalMode('add'); setIsModalOpen(true); }}
              />

              <DeliveryMethodSelector 
                methods={DELIVERY_METHODS}
                selectedMethodId={deliveryOption}
                onSelect={setDeliveryOption}
              />

              {/* CONFIRM BUTTON */}
              <button 
                onClick={handleConfirm}
                disabled={MOCK_ADDRESSES.length === 0}
                className={`w-full py-[14px] rounded-[12px] font-titillium text-[16px] font-semibold transition-all active:scale-[0.98] ${
                  MOCK_ADDRESSES.length === 0 
                  ? 'bg-[#f1f5f9] text-[#838383] cursor-not-allowed' 
                  : 'bg-[#ffe900] active:bg-[#f5e000] text-[#242424]'
                }`}
              >
                Confirm Address
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddressModal 
        isOpen={isModalOpen} 
        mode={modalMode} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default DeliverySection;