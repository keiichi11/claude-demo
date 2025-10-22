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
    <div className="flex flex-col h-full bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b px-4 py-3">
        <div className="text-sm text-gray-600">
          {currentWorkOrder ? (
            <>
              <div className="font-semibold">{currentWorkOrder.customer_name} 様</div>
              <div className="text-xs">
                {currentWorkOrder.model} | {currentStep || '作業前'}
              </div>
            </>
          ) : (
            <div className="text-gray-400">案件を選択してください</div>
          )}
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <div className="text-4xl mb-2">💬</div>
            <div>質問を入力するか、音声ボタンを押してください</div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="text-xs text-gray-500 mb-1">🤖 AI</div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
              <div className="text-xs text-gray-500 mb-1">🤖 AI</div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* 入力エリア */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          {/* テキスト入力 */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="質問を入力..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* 送信ボタン */}
          <button
            onClick={handleSendText}
            disabled={isLoading || !inputText.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            送信
          </button>

          {/* 音声ボタン */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`px-6 py-2 rounded-lg font-semibold ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-green-500 text-white hover:bg-green-600'
            } disabled:bg-gray-300 disabled:cursor-not-allowed`}
          >
            {isRecording ? '🔴 停止' : '🎤 音声'}
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          音声ボタンを押して話し、もう一度押して送信
        </div>
      </div>
    </div>
  );
}
