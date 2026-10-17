import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import AddressSelector from './AddressSelector';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import AddressModal from './AddressModal';

import { UserAddress, fetchUserAddresses } from '@/services/addressService';
import { fetchUserAddressesAction, deleteUserAddressAction } from '@/app/actions/addressActions';
import { useToast } from '@/components/ui/ToastProvider';

interface DeliverySectionProps {
  isOpen: boolean;
  isConfirmed: boolean;
  disabled?: boolean;
  userId: string;
  onConfirm: (address: UserAddress, option: string) => void;
  onToggle: () => void;
  externalError?: string | null;
  initialAddressId?: string;
  initialOption?: string;
  homeDeliveryCost?: number;
  pickupCost?: number;
  freeThreshold?: number;
  subtotal?: number;
}

export interface DeliverySectionHandle {
  handleConfirm: () => boolean;
}

const DeliverySection = forwardRef<DeliverySectionHandle, DeliverySectionProps>(({
  isOpen,
  isConfirmed,
  disabled = false,
  userId,
  onConfirm,
  onToggle,
  externalError,
  initialAddressId,
  initialOption,
  homeDeliveryCost = 150,
  pickupCost = 100,
  freeThreshold = 5000,
  subtotal,
}, ref) => {
  const deliveryMethods = [
    { id: 'home', title: 'Home Delivery', price: `NPR ${homeDeliveryCost}`, desc: 'Deliver the parcel to home address, Doorstep' },
    { id: 'pickup', title: 'Pickup', price: `NPR ${pickupCost}`, desc: 'Pickup from the nearest station' }
  ];
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(initialAddressId || '');
  const [deliveryOption, setDeliveryOption] = useState<string>(initialOption || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (externalError) setErrorMessage(externalError);
  }, [externalError]);

  useEffect(() => {
    // Only update from props if they actually have values (to avoid resetting during rehydration)
    if (initialAddressId) setSelectedAddressId(initialAddressId);
    if (initialOption) setDeliveryOption(initialOption);
  }, [initialAddressId, initialOption]);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      let addrs: UserAddress[] = [];
      if (userId) {
        addrs = await fetchUserAddresses(userId);
      }
      if (!addrs || addrs.length === 0) {
        const res = await fetchUserAddressesAction();
        if (res.data) addrs = res.data;
      }
      setAddresses(addrs);
      if (addrs.length > 0) {
        setSelectedAddressId(prev => {
          if (prev && addrs.some(a => a.id === prev)) return prev;
          if (initialAddressId && addrs.some(a => a.id === initialAddressId)) return initialAddressId;
          return addrs[0].id!;
        });
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, initialAddressId]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleConfirm = () => {
    setErrorMessage(null);
    const addr = addresses.find(a => a.id === selectedAddressId);

    if (!addr) {
      setErrorMessage("Please select or add a delivery address.");
      return false;
    }

    if (!deliveryOption) {
      setErrorMessage("Please select a delivery method to continue.");
      return false;
    }

    onConfirm(addr, deliveryOption);
    return true;
  };

  useImperativeHandle(ref, () => ({
    handleConfirm
  }));

  const handleModalSuccess = (addr: UserAddress) => {
    loadAddresses().then(() => {
      if (addr.id) setSelectedAddressId(addr.id);
    });
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;

    const result = await deleteUserAddressAction(id);
    if (result.success) {
      showToast("Address removed successfully!", "success");
      loadAddresses();
    } else {
      showToast(result.error || "Failed to remove address", "error");
    }
  };

  return (
    <div className={`w-full bg-white rounded-[20px] shadow-none overflow-hidden transition-all duration-300 ${
      disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
    }`}>
      {/* ACCORDION HEADER */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className="flex w-full justify-between items-center px-[20px] sm:px-[24px] py-[18px] sm:py-[20px] bg-white transition-colors duration-200 outline-none"
      >
        <div className="flex items-center gap-[10px] sm:gap-[12px]">
          <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-rajdhani text-[13px] font-bold shrink-0 transition-colors ${
            isConfirmed ? 'bg-[#308026] text-white' : 'bg-[#242424] text-white'
          }`}>
            {isConfirmed ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              '2'
            )}
          </div>
          <h2 className="font-rajdhani text-[18px] sm:text-[19px] font-bold leading-tight tracking-tight text-[#18181b]">
            Delivery Details
          </h2>
          {isConfirmed && !isOpen && !disabled && selectedAddressId && deliveryOption && (
            <div className="flex px-[8px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[6px]">
              <span className="font-rajdhani text-[12px] font-semibold text-[#166534] tracking-tight whitespace-nowrap">
                Details Added
              </span>
            </div>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <DropDownIcon className="w-[18px] h-[18px] text-[#18181b]" />
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
            <div className="w-full flex flex-col gap-[20px] px-[20px] sm:px-[24px] pb-[28px] pt-[16px] bg-white border-t border-[#f0f3ee]">

              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
                isLoading={isLoading}
                onSelect={setSelectedAddressId}
                onDelete={handleDeleteAddress}
                onEdit={(id) => {
                  const t = addresses.find(a => a.id === id);
                  if (t) setEditingAddress(t);
                  setModalMode('edit');
                  setIsModalOpen(true);
                }}
                onAddNew={() => {
                  setEditingAddress(null);
                  setModalMode('add');
                  setIsModalOpen(true);
                }}
              />

              <DeliveryMethodSelector
                methods={deliveryMethods}
                selectedMethodId={deliveryOption}
                hasError={!!errorMessage && !deliveryOption}
                freeThreshold={freeThreshold}
                subtotal={subtotal}
                onSelect={(id) => {
                  setDeliveryOption(id);
                  setErrorMessage(null);
                }}
              />

              {/* Validation Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-[13px] font-semibold text-[#ef4444] px-[2px]"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* CONFIRM BUTTON */}
              <button
                onClick={handleConfirm}
                disabled={isLoading || addresses.length === 0}
                className={`w-full h-[48px] rounded-[14px] font-rajdhani text-[16px] font-bold transition-all active:scale-[0.98] outline-none ${
                  isLoading || addresses.length === 0
                    ? 'bg-[#ffe900] text-[#18181b] opacity-40 cursor-not-allowed'
                    : 'bg-[#ffe900] hover:bg-[#f5e000] active:bg-[#ebd500] text-[#18181b]'
                }`}
              >
                {isLoading ? 'Loading Addresses...' : 'Confirm Address'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AddressModal
        isOpen={isModalOpen}
        mode={modalMode}
        userId={userId}
        initialAddress={editingAddress}
        onSuccess={handleModalSuccess}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
});

DeliverySection.displayName = 'DeliverySection';

export default DeliverySection;
