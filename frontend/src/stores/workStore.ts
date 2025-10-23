/**
 * 作業管理状態ストア
 */

import { create } from 'zustand';
import type { WorkOrder, WorkReport, WorkPhoto, UsedMaterial } from '@/types';

interface WorkState {
  workOrders: WorkOrder[];
  currentWorkOrder: WorkOrder | null;
  currentWorkReport: WorkReport | null;
  workPhotos: WorkPhoto[];
  usedMaterials: UsedMaterial[];

  // アクション
  setWorkOrders: (workOrders: WorkOrder[]) => void;
  setCurrentWorkOrder: (workOrder: WorkOrder | null) => void;
  setCurrentWorkReport: (workReport: WorkReport | null) => void;
  addWorkPhoto: (photo: WorkPhoto) => void;
  removeWorkPhoto: (photoId: string) => void;
  addUsedMaterial: (material: UsedMaterial) => void;
  updateUsedMaterial: (materialId: string, data: Partial<UsedMaterial>) => void;
  removeUsedMaterial: (materialId: string) => void;
  clearWorkData: () => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  workOrders: [],
  currentWorkOrder: null,
  currentWorkReport: null,
  workPhotos: [],
  usedMaterials: [],

  setWorkOrders: (workOrders) => set({ workOrders }),

  setCurrentWorkOrder: (workOrder) => set({ currentWorkOrder: workOrder }),

  setCurrentWorkReport: (workReport) => set({ currentWorkReport: workReport }),

  addWorkPhoto: (photo) =>
    set((state) => ({
      workPhotos: [...state.workPhotos, photo],
    })),

  removeWorkPhoto: (photoId) =>
    set((state) => ({
      workPhotos: state.workPhotos.filter((p) => p.id !== photoId),
    })),

  addUsedMaterial: (material) =>
    set((state) => ({
      usedMaterials: [...state.usedMaterials, material],
    })),

  updateUsedMaterial: (materialId, data) =>
    set((state) => ({
      usedMaterials: state.usedMaterials.map((m) =>
        m.id === materialId ? { ...m, ...data } : m
      ),
    })),

  removeUsedMaterial: (materialId) =>
    set((state) => ({
      usedMaterials: state.usedMaterials.filter((m) => m.id !== materialId),
    })),

  clearWorkData: () =>
    set({
      currentWorkOrder: null,
      currentWorkReport: null,
      workPhotos: [],
      usedMaterials: [],
    }),
}));
