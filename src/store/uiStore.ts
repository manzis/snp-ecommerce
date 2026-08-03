import { create } from 'zustand';

interface UIState {
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
  navTitle: string;
  navSubtitle?: string;
  showBack: boolean;
  onBack?: () => void;
  setNavData: (data: Partial<Pick<UIState, 'navTitle' | 'navSubtitle' | 'showBack' | 'onBack'>>) => void;
  navigatingProductSlug: string | null;
  setNavigatingProductSlug: (slug: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  hideBottomNav: false,
  setHideBottomNav: (hide) => set({ hideBottomNav: hide }),
  navTitle: '',
  navSubtitle: undefined,
  showBack: true,
  onBack: undefined,
  setNavData: (data) => set((state) => ({ ...state, ...data })),
  navigatingProductSlug: null,
  setNavigatingProductSlug: (slug) => set({ navigatingProductSlug: slug }),
}));
