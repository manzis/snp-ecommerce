'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DynamicPageNav from '@/components/layout/DynamicPageNav';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import DeliveryAddress from '@/components/cart/DeliveryAddress';
import CartCheckoutBar from '@/components/cart/CartCheckoutBar';
import CartCoupons from '@/components/cart/CartCoupons';
import { useCartStore } from '@/store/cartStore';
import CheckoutPrompt from '@/components/checkout/CheckoutPrompt';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';
import { fetchUserAddressesAction, deleteUserAddressAction } from '@/app/actions/addressActions';
import { UserAddress } from '@/services/addressService';
import AddressModal from '@/components/checkout/AddressModal';
import AddressSelector from '@/components/checkout/AddressSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/ToastProvider';

export default function CartPage() {

  const router = useRouter();
  const { items, loadCart, getCouponDiscount } = useCartStore();
  const { user, session, isLoading: isAuthLoading } = useAuth();
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

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setSelectedAddressId('');
    }
  }, [user]);

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
    return items.reduce((acc: number, item: any) => acc + (item.bundle_discount || 0), 0);
  }, [items]);

  const couponDiscount = getCouponDiscount();
  const finalTotal = subtotal - bundleDiscount - couponDiscount;

  // 2. HANDLERS
  const handleCheckout = () => {
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
    <div className={`min-h-screen bg-[#f7faf6] pt-[81px] ${items.length > 0 ? 'mb-[80px]' : ''}`}>
      {/* STICKY NAV */}
      <DynamicPageNav 
        title="My Cart" 
        subtitle={`${items.length} Items`} 
      />

      <main className="mx-auto w-full max-w-[1280px] lg:flex lg:gap-[24px] lg:px-[24px] lg:pt-[24px] mb-[48px] lg:mb-0">

        {/* LEFT COLUMN: Items, Delivery, and Coupons */}
        <div className="flex-1 flex flex-col gap-[12px]">
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

          {/* List of Cart Items */}
          <div className="flex flex-col gap-[12px]">
            {items.map((item: any) => (
              <CartItem key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="flex flex-col w-full items-center justify-center py-[100px] px-[24px] gap-[16px]">
                <div className="relative w-[125px] h-[125px] lg:w-[150px] lg:h-[150px] mb-[8px]">
                  <Image
                    src="/images/empty-cart.webp"
                    alt="Empty Cart"
                    fill
                    className="object-contain"
                  />
                </div>
                <h2 className="font-custom text-[22px] text-[#242424] text-center leading-tight">
                  Your Cart is Empty
                </h2>
                <p className="font-titillium text-[16px] text-[#8a8e91] text-center mt-[-8px]">
                  Stack up your daily dose of fitness now!
                </p>
                <button
                  onClick={() => router.push('/products')}
                  className="mt-[12px] flex h-[48px] items-center justify-center rounded-[16px] bg-[#3F9733] hover:bg-[#347d2a] px-[32px] font-titillium text-[16px] font-semibold text-white transition-all active:scale-[0.98] outline-none shadow-sm"
                >
                  Shop Now
                </button>
              </div>
            )}
          </div>

          {/* COUPONS SECTION: Placed between items and summary as requested */}
          {items.length > 0 && (
            <div className="lg:hidden">
              <CartCoupons onApply={() => { }} />
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Summary & Desktop Checkout (Sticky) */}
        {items.length > 0 && (
          <aside className="w-full lg:w-[380px] mt-[12px] lg:mt-0 h-fit">
            <div className="lg:sticky lg:top-[105px] flex flex-col gap-[16px]">

              <CartSummary />
              <div className="hidden lg:block">
                <CartCoupons onApply={() => { }} />
              </div>

              {/* Desktop Static Bar: Hidden on Mobile */}
              <div className="hidden lg:block">
                <CartCheckoutBar
                  isStatic={true}
                  totalAmount={`NPR ${finalTotal}`}
                  mrpAmount={`NPR ${totalMRP}`}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </aside>
        )}
      </main>

      <CheckoutPrompt />

      {/* Mobile Fixed Bar: Hidden on Desktop via component logic */}
      {items.length > 0 && (
        <CartCheckoutBar
          totalAmount={`NPR ${finalTotal.toLocaleString()}`}
          mrpAmount={`NPR ${totalMRP.toLocaleString()}`}
          buttonText="Checkout"
          onCheckout={handleCheckout}
        />
      )}

      {/* ADDRESS SELECTION MODAL */}
      <AnimatePresence>
        {isSelectionModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectionModalOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col w-full bg-white rounded-t-[24px] max-h-[90vh] overflow-hidden"
            >
              <div className="flex justify-center p-[16px]">
                <button onClick={() => setIsSelectionModalOpen(false)} className="w-[40px] h-[5px] bg-[#eaebf0] rounded-full" />
              </div>
              <div className="px-[24px] pb-[32px] overflow-y-auto">
                <h2 className="font-titillium text-[20px] font-bold text-[#242424] mb-[24px]">Select Delivery Address</h2>
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
    </div>
  );
}
