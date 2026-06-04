import { create } from 'zustand';
import type { Card } from '../lib/api';

interface AddCardStore {
  open: boolean;
  initialCard?: Card;
  openAdd: (card?: Card) => void;
  closeAdd: () => void;
}

export const useAddCard = create<AddCardStore>((set) => ({
  open: false,
  initialCard: undefined,
  openAdd: (card) => set({ open: true, initialCard: card }),
  closeAdd: () => set({ open: false, initialCard: undefined }),
}));
