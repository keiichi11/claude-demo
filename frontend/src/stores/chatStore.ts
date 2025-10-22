/**
 * チャット状態管理ストア
 */

import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  currentModel: string | null;
  currentStep: string | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  addMessage: (message: ChatMessage) => void;
  setCurrentModel: (model: string | null) => void;
  setCurrentStep: (step: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  currentModel: null,
  currentStep: null,
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setCurrentModel: (model) => set({ currentModel: model }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearMessages: () => set({ messages: [] }),
}));
