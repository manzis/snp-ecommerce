'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import CartCoupons from '@/components/cart/CartCoupons';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { fetchUserAddressesAction, deleteUserAddressAction } from '@/app/actions/addressActions';
import { UserAddress } from '@/services/addressService';
import AddressModal from '@/components/checkout/AddressModal';
import AddressSelector from '@/components/checkout/AddressSelector';
import { useToast } from '@/components/ui/ToastProvider';

export default function CartSidebar() {
  const router = useRouter();
  const { items, reverifyCartPrices, getCouponDiscount, isCartOpen, setCartOpen } = useCartStore();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { openLogin } = useAuthModal();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);

  // Modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<'add' | 'edit'>('add');
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      reverifyCartPrices();
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen, reverifyCartPrices]);

  useEffect(() => {
    if (user && isCartOpen) {
      fetchAddresses();
    } else if (!user) {
      setAddresses([]);
      setSelectedAddressId('');
    }
  }, [user, isCartOpen]);

  const fetchAddresses = async () => {
    setIsAddressesLoading(true);
    const { data, error } = await fetchUserAddressesAction();
    if (!error && data) {
      setAddresses(data);
      if (data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data[0].id || '');
      }
    }
    setIsAddressesLoading(false);
  };

  const selectedAddress = useMemo(() => {
    return addresses.find(addr => addr.id === selectedAddressId) || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // 1. CALCULATE TOTALS
  const subtotal = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  }, [items]);

  const totalMRP = useMemo(() => {
    return items.reduce((acc: number, item: any) => acc + ((item.mrp || item.price) * item.quantity), 0);
  }, [items]);

  const bundleDiscount = useMemo(() => {
    return Math.round(items.reduce((acc: number, item: any) => acc + ((item.bundle_discount || 0) * item.quantity), 0));
  }, [items]);

  const couponDiscount = getCouponDiscount();
  const finalTotal = useMemo(() => {
    return Math.round(subtotal - bundleDiscount - couponDiscount);
  }, [subtotal, bundleDiscount, couponDiscount]);

  // 2. HANDLERS
  const handleCheckout = () => {
    setCartOpen(false);
    router.push('/checkout');
  };

  const handleAddressChange = () => {
    setIsSelectionModalOpen(true);
  };

  const handleCreateAddress = () => {
    setAddressModalMode('add');
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleEditAddress = (id: string) => {
    const addr = addresses.find(a => a.id === id);
    if (addr) {
      setEditingAddress(addr);
      setAddressModalMode('edit');
      setIsAddressModalOpen(true);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const result = await deleteUserAddressAction(id);
    if (result.success) {
      showToast("Address deleted successfully!", "success");
      fetchAddresses();
    } else {
      showToast(result.error || "Failed to delete address", "error");
    }
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setIsSelectionModalOpen(false);
  };

  const handleAddressSuccess = (address: UserAddress) => {
    fetchAddresses();
    if (address.id) setSelectedAddressId(address.id);
    setIsAddressModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] hidden lg:block"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[110] flex flex-col w-[450px] bg-[#f7faf6] shadow-2xl hidden lg:flex"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#242424] font-rajdhani">My Cart</h2>
                <p className="text-sm text-[#71717a] font-rajdhani">{items.length} Items</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
              {items.length > 0 && (
                <DeliveryAddress
                  isLoggedIn={!!user}
                  isLoading={isAuthLoading}
                  name={selectedAddress?.first_name}
                  phoneSuffix={selectedAddress?.phone?.slice(-6)}
                  address={`${selectedAddress?.address_line_1}, ${selectedAddress?.street}, ${selectedAddress?.city}`}
                  type={selectedAddress?.type}
                  hasAddresses={addresses.length > 0}
                  onChange={handleAddressChange}
                  onLogin={openLogin}
                  onCreate={handleCreateAddress}
                />
              )}

              {/* Items List */}
              <div className="flex flex-col gap-3">
                {items.map((item: any) => (
                  <CartItem key={item.id} item={item} />
                ))}

                {items.length === 0 && (
                  <div className="flex flex-col w-full items-center justify-center py-20 px-6 gap-4">
                    <div className="relative w-[125px] h-[125px] mb-2">
                      <Image
                        src="/images/empty-cart.webp"
                        alt="Empty Cart"
                        fill
                        className="object-contain"
                      />
                    </div>
 <h2 className="font-rajdhani font-bold text-xl text-[#242424] text-center leading-tight">
                      Your Cart is Empty
                    </h2>
                    <p className="font-rajdhani text-sm text-[#8a8e91] text-center mt-[-8px]">
                      Stack up your daily dose of fitness now!
                    </p>
                    <button
                      onClick={() => {
                        setCartOpen(false);
                        router.push('/products');
                      }}
                      className="mt-3 flex h-12 items-center justify-center rounded-2xl bg-[#3F9733] hover:bg-[#347d2a] px-8 font-rajdhani text-base font-semibold text-white transition-all active:scale-[0.98]"
                    >
                      Shop Now
                    </button>
                  </div>
                )}
              </div>

              {/* Coupons & Summary */}
              {items.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <CartCoupons onApply={() => { }} />
                  <CartSummary />
                </div>
              )}
            </div>

            {/* Sticky Bottom Bar */}
            {items.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-4 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <CartCheckoutBar
                  isStatic={true}
                  totalAmount={`NPR ${finalTotal.toLocaleString()}`}
                  mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
                  onCheckout={handleCheckout}
                />
              </div>
            )}
          </motion.div>

          {/* Address Selection Modal - Rendered globally but triggered from sidebar */}
          <AnimatePresence>
            {isSelectionModalOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSelectionModalOpen(false)}
                  className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px]"
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                  className="fixed bottom-0 left-0 right-0 lg:left-auto lg:right-0 z-[130] flex flex-col w-full lg:w-[450px] bg-white rounded-t-[24px] max-h-[90vh] lg:max-h-screen lg:rounded-none overflow-hidden"
                >
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="font-rajdhani text-xl font-bold text-[#242424]">Select Delivery Address</h2>
                    <button onClick={() => setIsSelectionModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto">
                    <AddressSelector
                      addresses={addresses}
                      selectedId={selectedAddressId}
                      onSelect={handleAddressSelect}
                      onEdit={handleEditAddress}
                      onDelete={handleDeleteAddress}
                      onAddNew={handleCreateAddress}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            mode={addressModalMode}
            userId={user?.id || ''}
            initialAddress={editingAddress}
            onSuccess={handleAddressSuccess}
          />
        </>
      )}
    </AnimatePresence>
  );
}
