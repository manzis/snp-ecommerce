import { supabase } from '@/lib/supabase/client';
import type { CartItemType } from './cartService';

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_cart_value: number;
  max_discount?: number;
  product_id?: string | null;
  description?: string;
  is_active: boolean;
  expires_at?: string;
}

export interface ValidationResult {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  message?: string;
}

/**
 * Validates a coupon code against the current cart and subtotal
 */
export async function validateCoupon(
  code: string, 
  subtotal: number, 
  items: CartItemType[]
): Promise<ValidationResult> {
  const trimmedCode = code.trim().toUpperCase();

  // 1. Fetch coupon from DB
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', trimmedCode)
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return { isValid: false, discountAmount: 0, message: "Invalid or inactive coupon code" };
  }

  const typedCoupon = coupon as Coupon;

  // 2. Check Expiration
  if (typedCoupon.expires_at && new Date(typedCoupon.expires_at) < new Date()) {
    return { isValid: false, discountAmount: 0, message: "This coupon has expired" };
  }

  // 3. Check Minimum Cart Value
  if (subtotal < typedCoupon.min_cart_value) {
    return { 
      isValid: false, 
      discountAmount: 0, 
      message: `Min order NPR ${typedCoupon.min_cart_value.toLocaleString()} required` 
    };
  }

  // 4. Check Product Eligibility
  let eligibleAmount = subtotal;
  if (typedCoupon.product_id) {
    const eligibleItems = items.filter(item => item.product_id === typedCoupon.product_id);
    if (eligibleItems.length === 0) {
      return { 
        isValid: false, 
        discountAmount: 0, 
        message: "This coupon is not eligible for the items in your cart" 
      };
    }
    // For product-specific coupons, discount applies only to those items
    eligibleAmount = eligibleItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }

  // 5. Calculate Discount
  let discountAmount = 0;
  if (typedCoupon.type === 'percentage') {
    discountAmount = (eligibleAmount * typedCoupon.value) / 100;
  } else {
    discountAmount = typedCoupon.value;
  }

  // 6. Apply Max Discount Cap
  if (typedCoupon.max_discount && discountAmount > typedCoupon.max_discount) {
    discountAmount = typedCoupon.max_discount;
  }

  // Cap discount at eligible amount
  discountAmount = Math.min(discountAmount, eligibleAmount);

  return {
    isValid: true,
    coupon: typedCoupon,
    discountAmount,
    message: "Coupon applied successfully!"
  };
}
