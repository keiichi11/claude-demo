/**
 * バックエンドAPI連携サービス
 */

import axios from 'axios';
import type {
  TextChatRequest,
  TextChatResponse,
  VoiceChatResponse,
  AirconModel,
  WorkOrder,
  WorkReport,
  WorkPhoto,
  UsedMaterial,
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// エラーハンドリングインターセプター
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // サーバーがエラーレスポンスを返した
      const message = error.response.data?.detail || error.response.data?.message || 'サーバーエラーが発生しました';
      throw new Error(message);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない
      throw new Error('サーバーに接続できません。ネットワークを確認してください。');
    } else {
      // リクエスト設定時のエラー
      throw new Error('リクエストの送信に失敗しました');
    }
  }
);

// チャットAPI
export const chatApi = {
  /**
   * テキストチャット
   */
  async sendTextMessage(request: TextChatRequest): Promise<TextChatResponse> {
    const response = await apiClient.post<TextChatResponse>('/api/v1/chat/text', request);
    return response.data;
  },

  /**
   * 音声チャット
   */
  async sendVoiceMessage(
    audioBlob: Blob,
    model?: string,
    currentStep?: string
  ): Promise<VoiceChatResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    if (model) formData.append('model', model);
    if (currentStep) formData.append('current_step', currentStep);

    const response = await apiClient.post<VoiceChatResponse>(
      '/api/v1/chat/voice',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * 利用可能な機種一覧を取得
   */
  async getAvailableModels(): Promise<AirconModel[]> {
    const response = await apiClient.get<{ models: AirconModel[] }>('/api/v1/chat/models');
    return response.data.models;
  },
};

// 作業案件API
export const workOrderApi = {
  /**
   * 作業案件一覧取得
   */
  async getWorkOrders(params?: {
    status?: string;
    date?: string;
  }): Promise<WorkOrder[]> {
    const response = await apiClient.get<WorkOrder[]>('/api/v1/work-orders', { params });
    return response.data;
  },

  /**
   * 作業案件詳細取得
   */
  async getWorkOrder(id: string): Promise<WorkOrder> {
    const response = await apiClient.get<WorkOrder>(`/api/v1/work-orders/${id}`);
    return response.data;
  },

  /**
   * 作業案件作成
   */
  async createWorkOrder(data: Partial<WorkOrder>): Promise<WorkOrder> {
    const response = await apiClient.post<WorkOrder>('/api/v1/work-orders', data);
    return response.data;
  },

  /**
   * 作業案件更新
   */
  async updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<WorkOrder> {
    const response = await apiClient.patch<WorkOrder>(`/api/v1/work-orders/${id}`, data);
    return response.data;
  },
};

// 作業報告API
export const workReportApi = {
  /**
   * 作業報告一覧取得
   */
  async getWorkReports(): Promise<WorkReport[]> {
    const response = await apiClient.get<WorkReport[]>('/api/v1/work-reports');
    return response.data;
  },

  /**
   * 作業報告詳細取得
   */
  async getWorkReport(id: string): Promise<WorkReport> {
    const response = await apiClient.get<WorkReport>(`/api/v1/work-reports/${id}`);
    return response.data;
  },

  /**
   * 作業報告作成
   */
  async createWorkReport(data: Partial<WorkReport>): Promise<WorkReport> {
    const response = await apiClient.post<WorkReport>('/api/v1/work-reports', data);
    return response.data;
  },

  /**
   * 作業報告更新
   */
  async updateWorkReport(id: string, data: Partial<WorkReport>): Promise<WorkReport> {
    const response = await apiClient.patch<WorkReport>(`/api/v1/work-reports/${id}`, data);
    return response.data;
  },

  /**
   * 作業報告送信
   */
  async submitWorkReport(id: string): Promise<WorkReport> {
    const response = await apiClient.post<WorkReport>(`/api/v1/work-reports/${id}/submit`);
    return response.data;
  },
};

// 施工写真API
export const workPhotoApi = {
  /**
   * 写真アップロード
   */
  async uploadPhoto(
    reportId: string,
    photoFile: File,
    photoType: 'before' | 'during' | 'after' | 'trouble',
    caption?: string
  ): Promise<WorkPhoto> {
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('work_report_id', reportId);
    formData.append('photo_type', photoType);
    if (caption) formData.append('caption', caption);

    const response = await apiClient.post<WorkPhoto>('/api/v1/work-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * 写真削除
   */
  async deletePhoto(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/work-photos/${id}`);
  },
};

// 使用部材API
export const usedMaterialApi = {
  /**
   * 使用部材追加
   */
  async addMaterial(data: Partial<UsedMaterial>): Promise<UsedMaterial> {
    const response = await apiClient.post<UsedMaterial>('/api/v1/used-materials', data);
    return response.data;
  },

  /**
   * 使用部材更新
   */
  async updateMaterial(id: string, data: Partial<UsedMaterial>): Promise<UsedMaterial> {
    const response = await apiClient.patch<UsedMaterial>(`/api/v1/used-materials/${id}`, data);
    return response.data;
  },

  /**
   * 使用部材削除
   */
  async deleteMaterial(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/used-materials/${id}`);
  },
};

export default {
  chat: chatApi,
  workOrder: workOrderApi,
  workReport: workReportApi,
  workPhoto: workPhotoApi,
  usedMaterial: usedMaterialApi,
};
