import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContactData {
  value: string;
  marketing: boolean;
}

interface DeliveryData {
  addressId: string;
  option: string;
  shippingPrice: number;
  addressDetails?: any;
}

interface CheckoutState {
  activeStep: 'contact' | 'delivery' | 'payments' | null;
  completedSteps: string[];
  contactData: ContactData;
  deliveryData: DeliveryData | null;
  selectedPaymentId: string | null;

  setActiveStep: (step: 'contact' | 'delivery' | 'payments' | null) => void;
  setCompletedSteps: (steps: string[] | ((prev: string[]) => string[])) => void;
  setContactData: (data: ContactData) => void;
  setDeliveryData: (data: DeliveryData | null) => void;
  setSelectedPaymentId: (id: string | null) => void;
  reset: () => void;
  clearSelections: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      activeStep: 'contact',
      completedSteps: [],
      contactData: { value: '', marketing: true },
      deliveryData: null,
      selectedPaymentId: null,

      setActiveStep: (step) => set({ activeStep: step }),
      setCompletedSteps: (steps) =>
        set((state) => ({
          completedSteps: typeof steps === 'function' ? steps(state.completedSteps) : steps,
        })),
      setContactData: (data) => set({ contactData: data }),
      setDeliveryData: (data) => set({ deliveryData: data }),
      setSelectedPaymentId: (id) => set({ selectedPaymentId: id }),

      reset: () => set({
        activeStep: 'contact',
        completedSteps: [],
        contactData: { value: '', marketing: true },
        deliveryData: null,
        selectedPaymentId: null
      }),

      clearSelections: () => set({
        activeStep: 'contact',
        completedSteps: [],
        deliveryData: null,
        selectedPaymentId: null
      }),
    }),
    {
      name: 'checkout-storage',
    }
  )
);
