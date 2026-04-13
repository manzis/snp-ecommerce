import { create } from 'zustand';

interface ProductSelectionState {
  selectedSize: string | null;
  selectedFlavorId: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  sizeError: boolean;
  flavorError: boolean;
  setSize: (size: string | null) => void;
  setFlavorId: (id: string | null) => void;
  setPrice: (discounted: number | null, original: number | null) => void;
  setSizeError: (error: boolean) => void;
  setFlavorError: (error: boolean) => void;
  reset: () => void;
}

export const useProductSelectionStore = create<ProductSelectionState>()((set) => ({
  selectedSize: null,
  selectedFlavorId: null,
  currentPrice: null,
  originalPrice: null,
  sizeError: false,
  flavorError: false,
  setSize: (size) => set({ selectedSize: size, sizeError: false }),
  setFlavorId: (id) => set({ selectedFlavorId: id, flavorError: false }),
  setPrice: (discounted, original) => set({ currentPrice: discounted, originalPrice: original }),
  setSizeError: (error) => set({ sizeError: error }),
  setFlavorError: (error) => set({ flavorError: error }),
  reset: () => set({ 
    selectedSize: null, 
    selectedFlavorId: null, 
    currentPrice: null, 
    originalPrice: null, 
    sizeError: false, 
    flavorError: false 
  })
}));
