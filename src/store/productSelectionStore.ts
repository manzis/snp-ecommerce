import { create } from 'zustand';

interface ProductSelectionState {
  selectedSize: string | null;
  selectedFlavor: string | null;
  sizeError: boolean;
  flavorError: boolean;
  setSize: (size: string | null) => void;
  setFlavor: (flavor: string | null) => void;
  setSizeError: (error: boolean) => void;
  setFlavorError: (error: boolean) => void;
  reset: () => void;
}

export const useProductSelectionStore = create<ProductSelectionState>()((set) => ({
  selectedSize: null,
  selectedFlavor: null,
  sizeError: false,
  flavorError: false,
  setSize: (size) => set({ selectedSize: size, sizeError: false }),
  setFlavor: (flavor) => set({ selectedFlavor: flavor, flavorError: false }),
  setSizeError: (error) => set({ sizeError: error }),
  setFlavorError: (error) => set({ flavorError: error }),
  reset: () => set({ selectedSize: null, selectedFlavor: null, sizeError: false, flavorError: false })
}));
