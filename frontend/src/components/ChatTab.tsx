/**
 * チャットタブコンポーネント
 * 音声・テキストでの対話機能
 */

import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useWorkStore } from '@/stores/workStore';
import { chatApi } from '@/services/api';

export function ChatTab() {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentModel,
    currentStep,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
  } = useChatStore();

  const { currentWorkOrder } = useWorkStore();

  // メッセージ末尾へ自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // テキスト送信
  const handleSendText = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: inputText };
    addMessage(userMessage);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendTextMessage({
        message: inputText,
        model: currentModel || currentWorkOrder?.model,
        current_step: currentStep || undefined,
        chat_history: messages,
      });

      addMessage({ role: 'assistant', content: response.reply });

      // 安全警告があれば表示
      if (response.safety_warnings && response.safety_warnings.length > 0) {
        console.warn('Safety warnings:', response.safety_warnings);
      }
    } catch (err: any) {
      setError(err.message || '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 音声録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleSendVoice(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setError('マイクへのアクセスが拒否されました');
    }
  };

  // 音声録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 音声送信
  const handleSendVoice = async (audioBlob: Blob) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendVoiceMessage(
        audioBlob,
        currentModel || currentWorkOrder?.model,
        currentStep || undefined
      );

      // 認識されたテキストをユーザーメッセージとして追加
      addMessage({ role: 'user', content: response.transcript });

      // AIの応答を追加
      addMessage({ role: 'assistant', content: response.reply });

      // 応答音声を再生
      if (response.audio_url) {
        const audio = new Audio(response.audio_url);
        audio.play();
      }
    } catch (err: any) {
      setError(err.message || '音声送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-base">
      {/* ヘッダー */}
      <div className="bg-bg-card border-b border-border h-20 px-8 flex items-center">
        {currentWorkOrder ? (
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-bg-elevated flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div className="text-body font-semibold text-text-secondary">{currentWorkOrder.customer_name} 様</div>
              <div className="text-small text-text-tertiary flex items-center space-x-2 mt-0.5">
                <span>{currentWorkOrder.model}</span>
                <span>·</span>
                <span className="px-2 py-0.5 bg-bg-elevated text-text-muted rounded-full text-caption">
                  {currentStep || '作業前'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-body text-text-tertiary">
            案件を選択してください
          </div>
        )}
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-content mx-auto space-y-5">
          {messages.length === 0 ? (
            <div className="text-center mt-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-6">
                <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-subheading text-text-secondary mb-2">作業をサポートします</h3>
              <p className="text-body text-text-tertiary max-w-md mx-auto leading-relaxed">
                質問を入力するか、音声ボタンを押して話しかけてください
              </p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-bg-card border border-border shadow-card'
                }`}>
                  <div className={`whitespace-pre-wrap text-body leading-relaxed ${
                    msg.role === 'user' ? 'text-white' : 'text-text-primary'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg-card border border-border rounded-2xl px-4 py-3 shadow-card">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mx-8 mb-6">
          <div className="max-w-content mx-auto px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-2">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-body text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-bg-card border-t border-border px-8 py-6">
        <div className="max-w-content mx-auto">
          <div className="flex gap-3">
            {/* テキスト入力 */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendText()}
              placeholder="質問を入力..."
              disabled={isLoading}
              className="flex-1 h-11 px-4 border-[1.5px] border-border rounded-2xl text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:border-primary disabled:bg-bg-elevated disabled:text-text-tertiary transition-[border-color,box-shadow] duration-150"
            />

            {/* 送信ボタン */}
            <button
              onClick={handleSendText}
              disabled={isLoading || !inputText.trim()}
              className="h-11 px-6 bg-primary text-white rounded-2xl text-body font-medium hover:bg-primary-hover disabled:bg-text-tertiary disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              送信
            </button>

            {/* 音声ボタン */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`h-11 px-6 rounded-2xl text-body font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse focus-visible:ring-red-500'
                  : 'bg-transparent border-[1.5px] border-border text-text-secondary hover:bg-bg-elevated focus-visible:ring-primary'
              } disabled:bg-text-tertiary disabled:border-text-tertiary disabled:text-white disabled:cursor-not-allowed`}
            >
              {isRecording ? '停止' : '音声'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
