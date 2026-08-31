import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DropDownIcon from '@/components/icons/DropDownIcon';
import AddressSelector from './AddressSelector';
import DeliveryMethodSelector from './DeliveryMethodSelector';
import AddressModal from './AddressModal';

import { UserAddress } from '@/services/addressService';
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
  freeThreshold = 5000
}, ref) => {
  const deliveryMethods = [
    { id: 'home', title: 'Home Delivery', price: `NPR ${homeDeliveryCost}`, desc: 'Deliver the parcel to home address, Doorstep' },
    { id: 'pickup', title: 'Pickup', price: `NPR ${pickupCost}`, desc: 'Pickup from the nearest station' }
  ];
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(initialAddressId || '');
  const [deliveryOption, setDeliveryOption] = useState<string>(initialOption || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  React.useEffect(() => {
    fetchUserAddressesAction().then(res => {
      if (res.data) {
        setAddresses(res.data);
        // Auto-select first address only if nothing is selected yet (not in store and not selected locally)
        if (res.data.length > 0 && !initialAddressId && !selectedAddressId) {
          setSelectedAddressId(res.data[0].id!);
        }
      }
    });
  }, [initialAddressId, selectedAddressId]);

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
    // Refresh addresses
    fetchUserAddressesAction().then(res => {
      if (res.data) {
        setAddresses(res.data);
        setSelectedAddressId(addr.id!);
      }
    });
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;

    const result = await deleteUserAddressAction(id);
    if (result.success) {
      showToast("Address removed successfully!", "success");
      fetchUserAddressesAction().then(res => {
        if (res.data) {
          setAddresses(res.data);
          if (selectedAddressId === id) {
            setSelectedAddressId(res.data.length > 0 ? res.data[0].id! : '');
          }
        }
      });
    } else {
      showToast(result.error || "Failed to remove address", "error");
    }
  };

  return (
    <div className={`main-container mx-auto flex w-full  flex-col items-start  border-t border-[#f1f5f9] lg:max-w-none transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}>
      {/* ACCORDION HEADER */}
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`flex w-full justify-between items-center px-[24px] transition-colors duration-300 ${isOpen ? 'bg-[#fafbfb] py-[24px]' : 'bg-white py-[24px]'
          }`}
      >
        <div className="flex items-center gap-[12px]">
          <h1 className="font-rajdhani text-[20px] font-semibold leading-[30px] tracking-[-0.8px] text-[#242424]">
            Delivery Details
          </h1>
          {isConfirmed && !isOpen && !disabled && selectedAddressId && deliveryOption && (
            <div className="flex px-[6px] py-[2px] justify-center items-center bg-[#eaffcc] rounded-[4px]">
              <span className="font-rajdhani text-[12px] leading-[12px] text-[#575757] tracking-[-0.48px]">
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
            <div className="w-full max-w-full min-w-0 flex flex-col gap-[24px] px-[24px] pb-[32px] pt-[24px] bg-white rounded-[24px_24px_0_0] border-t border-[#f1f5f9]">

              <AddressSelector
                addresses={addresses}
                selectedId={selectedAddressId}
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
                    className="text-[12px] font-semibold text-[#ef4444] px-[2px]"
                  >
                    {errorMessage}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* CONFIRM BUTTON */}
              <button
                onClick={handleConfirm}
                disabled={addresses.length === 0}
                className={`w-full py-[14px] rounded-[12px] font-rajdhani text-[16px] font-semibold transition-all active:scale-[0.98] ${addresses.length === 0
                  ? 'bg-[#ffe900] text-[#242424] opacity-50 cursor-not-allowed'
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
