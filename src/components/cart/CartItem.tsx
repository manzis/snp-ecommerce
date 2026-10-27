'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, Heart, Check, CreditCard, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import FlashIcon from '@/components/icons/FlashIcon';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ui/ToastProvider';
import type { CartItemType } from '@/services/cartService';

interface CartItemProps {
  item: CartItemType;
}

const getDeliveryDates = (isPre: boolean) => {
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

  if (isPre) {
    const start = new Date(today);
    start.setDate(today.getDate() + 4);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return `${start.toLocaleDateString('en-US', dateOptions)} - ${end.toLocaleDateString('en-US', dateOptions)}`;
  } else {
    const start = new Date(today);
    start.setDate(today.getDate() + 2);
    const end = new Date(today);
    end.setDate(today.getDate() + 3);
    return `${start.toLocaleDateString('en-US', dateOptions)} - ${end.toLocaleDateString('en-US', dateOptions)}`;
  }
};

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { items, updateQuantity, removeItem, toggleItemSelection } = useCartStore();
  const { showToast } = useToast();
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const isSelected = item.selected !== false;

  const bundleTotalDiscount = React.useMemo(() => {
    if (!item.bundle_id) return 0;
    return Math.round(items
      .filter(i => i.bundle_id === item.bundle_id)
      .reduce((acc, i) => acc + ((i.bundle_discount || 0) * i.quantity), 0));
  }, [items, item.bundle_id]);

  const isPreOrder = React.useMemo(() => {
    if (!item.stock_status) return false;
    const status = item.stock_status.toLowerCase().replace(/[-_]/g, '');
    return status === 'preorder';
  }, [item.stock_status]);

  const isOutOfStock = React.useMemo(() => {
    if (!item.stock_status) return false;
    const status = item.stock_status.toLowerCase().replace(/[^a-z]/g, '');
    return status === 'outofstock' || status === 'soldout' || status === 'out';
  }, [item.stock_status]);

  const [resolvedBrand, setResolvedBrand] = React.useState<string | null>(
    item.brand && item.brand !== 'Store Product' ? item.brand : null
  );

  React.useEffect(() => {
    if (item.brand && item.brand !== 'Store Product') {
      setResolvedBrand(item.brand);
      return;
    }
    const productId = item.product_id || (item.id && item.id.length >= 36 ? item.id.slice(0, 36) : null);
    if (productId) {
      import('@/lib/supabase/client').then(({ supabase }) => {
        supabase
          .from('products')
          .select('brands(name)')
          .eq('id', productId)
          .single()
          .then(({ data }) => {
            const b = (data as any)?.brands;
            const name = Array.isArray(b) ? b[0]?.name : b?.name;
            if (name) setResolvedBrand(name);
          });
      });
    }
  }, [item.product_id, item.brand, item.id]);

  const displayTitle = React.useMemo(() => {
    if (!resolvedBrand) return item.name;
    const cleanBrand = resolvedBrand.trim();
    if (item.name.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
      return item.name;
    }
    return `${cleanBrand} - ${item.name}`;
  }, [item.name, resolvedBrand]);

  const deliveryEstimateStr = React.useMemo(() => {
    return getDeliveryDates(isPreOrder);
  }, [isPreOrder]);

  const [effectiveSaleEndDate, setEffectiveSaleEndDate] = React.useState<string | undefined>(item.sale_end_date);
  const [saleTimeLeft, setSaleTimeLeft] = React.useState('');

  React.useEffect(() => {
    if (item.sale_end_date) {
      setEffectiveSaleEndDate(item.sale_end_date);
      return;
    }
    if (item.is_sale) {
      const productId = item.product_id || (item.id && item.id.length >= 36 ? item.id.slice(0, 36) : null);
      if (productId) {
        import('@/lib/supabase/client').then(({ supabase }) => {
          supabase
            .from('sales_offers_products')
            .select('sales_offers(ends_at, is_active)')
            .eq('product_id', productId)
            .then(({ data }) => {
              if (data && data.length > 0) {
                const active = data
                  .map((d: any) => d.sales_offers)
                  .find((s: any) => s && s.is_active && new Date(s.ends_at) > new Date());
                if (active?.ends_at) {
                  setEffectiveSaleEndDate(active.ends_at);
                }
              }
            });
        });
      }
    }
  }, [item.is_sale, item.sale_end_date, item.product_id, item.id]);

  React.useEffect(() => {
    if (!item.is_sale || !effectiveSaleEndDate) {
      setSaleTimeLeft('');
      return;
    }
    const endsAt = new Date(effectiveSaleEndDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endsAt - now;

      if (distance < 0) {
        setSaleTimeLeft('Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      parts.push(`${seconds}s`);

      setSaleTimeLeft(parts.join(' '));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item.is_sale, effectiveSaleEndDate]);

  const isSale = Boolean(item.is_sale && (!effectiveSaleEndDate || new Date(effectiveSaleEndDate).getTime() > Date.now()));

  const effectivePrice = Math.round(item.price - (item.bundle_discount || 0));
  const hasDiscount = item.mrp > effectivePrice;
  const discountPercent = hasDiscount ? Math.round(((item.mrp - effectivePrice) / item.mrp) * 100) : 0;

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      removeItem(item);
      showToast("Item Removed Successfully!", "success");
    } else {
      updateQuantity(item, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(item, item.quantity + 1);
  };

  const badgeText = isOutOfStock ? 'Out of stock' : isPreOrder ? 'Global' : 'Express';

  return (
    <div className={`w-full bg-white rounded-[20px] shadow-none overflow-hidden flex flex-col relative transition-all ${isOutOfStock ? 'opacity-85' : !isSelected ? 'opacity-75' : ''}`}>
      
      {/* Top Banner Tab: Express / Global / Out of stock */}
      <div className={`relative w-full h-[36px] overflow-hidden select-none transition-colors ${
        isOutOfStock
          ? 'bg-[#fff5f5]'
          : isPreOrder
          ? 'bg-[#fbf4eb]'
          : 'bg-[#fffde7]'
      }`}>
        <svg
          className="absolute top-0 left-0 h-full w-[210px] pointer-events-none"
          viewBox="0 0 210 36"
          preserveAspectRatio="none"
        >
          {/* Subtle under-wave accent */}
          <path
            d="M0,0 L165,0 C185,0 180,36 210,36 L0,36 Z"
            fill={isPreOrder ? '#fed7aa' : isOutOfStock ? '#fecaca' : '#fff066'}
            opacity="0.5"
          />
          {/* Main top wave */}
          <path
            d="M0,0 L145,0 C165,0 160,36 190,36 L0,36 Z"
            fill={isPreOrder ? '#fdba74' : isOutOfStock ? '#fca5a5' : '#ffea00'}
          />
        </svg>

        <div className="absolute top-0 left-0 h-full flex items-center pl-4 z-10">
          <span className="font-rajdhani font-bold italic text-[15px] text-black tracking-tight">
            {badgeText}
          </span>
        </div>
      </div>

      {/* Bundle Savings Notification */}
      {bundleTotalDiscount > 0 && (
        <div className="w-full bg-[#f2f9f1] rounded-b-[16px] px-4 py-2 flex items-center justify-center text-center">
          <span className="font-rajdhani text-[13px] font-bold text-[#308026] tracking-wide">
            Congrats! You save Rs. {bundleTotalDiscount} with this bundle deal
          </span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex p-[14px_16px_16px_16px] gap-3.5 items-start">
        
        {/* Left Column: Checkbox, Image & Quantity Controller */}
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-[105px] h-[105px] sm:w-[115px] sm:h-[115px] rounded-[14px] bg-[#fafafa] flex items-center justify-center p-2 shadow-none">
            
            {/* Dark Checkbox Button */}
            <button
              type="button"
              onClick={() => toggleItemSelection(item.id)}
              className={`absolute top-2 left-2 z-10 w-[20px] h-[20px] rounded-[5px] flex items-center justify-center transition-colors shadow-none cursor-pointer ${
                isSelected ? 'bg-[#18181b] text-white' : 'bg-white border border-[#d4d4d8] text-transparent hover:border-[#18181b]'
              }`}
              title={isSelected ? 'Deselect item' : 'Select item'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {/* Product Image */}
            <Link
              href={item.slug ? `/product/${item.slug}` : '#'}
              className="relative w-full h-full flex items-center justify-center cursor-pointer"
            >
              <Image
                src={item.image || '/images/protein.webp'}
                alt={item.name}
                fill
                className="object-contain p-1 hover:scale-105 transition-transform"
                sizes="(max-width: 640px) 105px, 115px"
              />
            </Link>
          </div>

          {/* Pill Quantity Selector (Directly beneath image) */}
          <div className="w-[105px] sm:w-[115px] h-[34px] rounded-[8px] border border-[#e4e4e7] bg-white flex items-center justify-between px-2.5 mt-2.5 select-none shadow-none">
            <button
              type="button"
              onClick={handleDecrease}
              className="w-6 h-6 flex items-center justify-center text-[#71717a] hover:text-[#ef4444] active:scale-90 transition-transform"
              title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
            >
              {item.quantity === 1 ? (
                <Trash2 className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
            </button>

            <span className="font-rajdhani font-bold text-[16px] text-[#18181b]">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={handleIncrease}
              className="w-6 h-6 flex items-center justify-center text-[#71717a] hover:text-[#18181b] active:scale-90 transition-transform"
              title="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Title, Variant, Price, Delivery & Badges */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          
          {/* Title & Wishlist Button */}
          <div className="relative min-w-0 pr-[36px] pb-1">
            <Link href={item.slug ? `/product/${item.slug}` : '#'} className="block group">
              <h3 className="font-rajdhani font-bold text-[16px] sm:text-[17px] text-[#18181b] leading-[20px] line-clamp-2 group-hover:text-[#308026] transition-colors tracking-tight">
                {displayTitle}
              </h3>
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsWishlisted(!isWishlisted);
                showToast(!isWishlisted ? "Added to Wishlist!" : "Removed from Wishlist!", "success");
              }}
              className="absolute top-0 right-0 w-[28px] h-[28px] rounded-[8px] border border-[#e4e4e7] bg-white flex items-center justify-center text-[#71717a] hover:text-[#ef4444] shrink-0 active:scale-95 transition-all shadow-none"
              title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#ef4444] text-[#ef4444]' : 'text-[#71717a]'}`} />
            </button>
          </div>

          {/* Variant Chip (e.g. Color: Collector > or Flavour: Chocolate >) */}
          {(item.selected_flavor || item.selected_size) && (
            <Link
              href={item.slug ? `/product/${item.slug}` : '#'}
              className="inline-flex items-center gap-1.5 bg-[#f4f4f5] text-[#52525b] font-rajdhani text-[13px] font-semibold px-2.5 pt-1 pb-[3px] rounded-[6px] w-fit max-w-full hover:bg-[#ebebeb] transition-colors self-start min-w-0"
              title={[
                item.selected_flavor ? `Flavour: ${item.selected_flavor}` : null,
                item.selected_size ? `Size: ${item.selected_size}` : null
              ].filter(Boolean).join(', ')}
            >
              <span className="truncate min-w-0">
                {[
                  item.selected_flavor ? `Flavour: ${item.selected_flavor}` : null,
                  item.selected_size ? `Size: ${item.selected_size}` : null
                ].filter(Boolean).join(', ')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
            </Link>
          )}

          {/* Pricing Row: Price + Strikethrough + Discount % */}
          <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
            <span
              className={`font-rajdhani font-bold text-[19px] sm:text-[21px] tracking-tight ${
                isSale
                  ? 'bg-[linear-gradient(90deg,#ff0000_0%,#ff2a00_70%,#ff7300_100%)] bg-clip-text text-transparent'
                  : 'text-[#18181b]'
              }`}
            >
              Rs. {effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="font-rajdhani font-semibold text-[15px] text-[#a1a1aa] line-through decoration-[#a1a1aa]">
                  {item.mrp.toLocaleString()}
                </span>
                <span className="font-rajdhani font-bold text-[13px] text-[#059669]">
                  {discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Sale Countdown Timer */}
          {isSale && saleTimeLeft && saleTimeLeft !== 'Ended' && (
            <div className="flex items-center gap-1.5 text-[12px] font-rajdhani font-semibold text-[#E3241B] mt-[-2px]">
              <FlashIcon className="w-[14px] h-[14px] shrink-0 text-[#E3241B]" />
              <span>Sale ends in {saleTimeLeft}</span>
            </div>
          )}

          {/* Delivery Promise Badge (No countdown) */}
          <div className="flex flex-col gap-0.5 mt-0.5">
            <span className="bg-[linear-gradient(90deg,#fef9c3_0%,#fef9c3_60%,#ffffff_100%)] text-[#713f12] font-rajdhani font-bold text-[12px] pl-2 pr-3.5 py-0.5 rounded-[4px] w-fit">
              Get it by {deliveryEstimateStr}
            </span>
          </div>

          {/* Trust / Policy Badges (Prepaid & COD, 100% Genuine) */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-[#71717a] font-rajdhani font-medium mt-1.5 pt-1.5 border-t border-[#f4f4f5]">
            <span className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-[#71717a]" />
              Prepaid & COD
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#71717a]" />
              100% Genuine
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartItem;
