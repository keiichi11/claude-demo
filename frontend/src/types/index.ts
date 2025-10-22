/**
 * 型定義
 */

export interface WorkOrder {
  id: string;
  customer_name: string;
  customer_phone?: string;
  address: string;
  building_type?: string;
  model: string;
  quantity: number;
  scheduled_date: string;
  worker_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface WorkReport {
  id: string;
  work_order_id: string;
  start_time?: string;
  end_time?: string;
  work_duration?: number;
  work_content?: string;
  special_notes?: string;
  customer_signature_url?: string;
  status: 'draft' | 'submitted' | 'approved';
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkPhoto {
  id: string;
  work_report_id: string;
  photo_url: string;
  photo_type: 'before' | 'during' | 'after' | 'trouble';
  caption?: string;
  taken_at: string;
  created_at?: string;
}

export interface UsedMaterial {
  id: string;
  work_report_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  created_at?: string;
}

export interface WorkStep {
  id: string;
  work_report_id: string;
  step_name: string;
  step_order: number;
  start_time?: string;
  end_time?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  created_at?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface TextChatRequest {
  message: string;
  model?: string;
  current_step?: string;
  chat_history?: ChatMessage[];
}

export interface TextChatResponse {
  reply: string;
  model_used: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  safety_warnings?: string[];
}

export interface VoiceChatResponse {
  transcript: string;
  reply: string;
  audio_url: string;
  model_used: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  safety_warnings?: string[];
}

export interface AirconModel {
  model: string;
  manufacturer: string;
  series: string;
  capacity: string;
}
