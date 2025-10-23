/**
 * ChatPage - Improved chat interface with better UX
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, ArrowDown } from 'lucide-react';
import { Button, Badge, EmptyState } from '../components/ui';
import { ChatMessage } from '../components/chat/ChatMessage';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { VoiceButton } from '../components/chat/VoiceButton';
import { useChatStore } from '../stores/chatStore';
import { useWorkStore } from '../stores/workStore';
import { chatApi } from '../services/api';

export function ChatPage() {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const { workOrders, currentWorkOrder, setCurrentWorkOrder } = useWorkStore();

  // Initialize with first work order if available
  React.useEffect(() => {
    if (!currentWorkOrder && workOrders.length > 0) {
      setCurrentWorkOrder(workOrders[0]);
    }
  }, [currentWorkOrder, workOrders, setCurrentWorkOrder]);

  // Auto scroll to bottom
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle scroll to show/hide scroll button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Send text message
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

      if (response.safety_warnings && response.safety_warnings.length > 0) {
        console.warn('Safety warnings:', response.safety_warnings);
      }
    } catch (err: any) {
      setError(err.message || '送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // Voice recording
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendVoice = async (audioBlob: Blob) => {
    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendVoiceMessage(
        audioBlob,
        currentModel || currentWorkOrder?.model,
        currentStep || undefined
      );

      addMessage({ role: 'user', content: response.transcript });
      addMessage({ role: 'assistant', content: response.reply });

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

  const suggestedQuestions = [
    '室内機の取付位置の基準を教えて',
    '真空引きの手順を教えて',
    'フレア加工のコツは？',
  ];

  return (
    <div className="flex flex-col h-full bg-[#f7f9fa]">
      {/* Context Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        {currentWorkOrder ? (
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-gray-900">
                {currentWorkOrder.customer_name} 様
              </h2>
              {currentStep && <Badge variant="info">{currentStep}</Badge>}
            </div>
            <p className="text-sm text-gray-500 mt-1.5">
              {currentWorkOrder.model} | {currentWorkOrder.address}
            </p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto text-center text-gray-500">
            <p className="text-sm">作業案件を選択すると、より的確な回答が得られます</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <EmptyState
                icon="💬"
                title="AIアシスタントがお手伝いします"
                description="作業に関する質問や、手順の確認などお気軽にお尋ねください"
              />
              {/* Suggested Questions */}
              <div className="mt-8 w-full max-w-lg space-y-3">
                <p className="text-sm text-gray-600 font-medium mb-4">よくある質問:</p>
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(question)}
                    className="w-full text-left px-5 py-4 bg-white border border-gray-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-all text-sm shadow-sm hover:shadow-md font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  role={msg.role}
                  content={msg.content}
                  timestamp={new Date()}
                />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
          aria-label="最新のメッセージへスクロール"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder="質問を入力... (Shift+Enterで改行)"
                disabled={isLoading || isRecording}
                rows={1}
                className="w-full px-5 py-3.5 pr-12 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm"
                style={{
                  minHeight: '52px',
                  maxHeight: '120px',
                }}
              />
            </div>

            <Button
              onClick={handleSendText}
              disabled={isLoading || !inputText.trim() || isRecording}
              variant="primary"
              size="lg"
              className="min-w-[64px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md"
              aria-label="送信"
            >
              <Send className="h-5 w-5" />
            </Button>

            <VoiceButton
              isRecording={isRecording}
              disabled={isLoading}
              onStart={startRecording}
              onStop={stopRecording}
            />
          </div>

          <p className="mt-3 text-xs text-center text-gray-500">
            音声ボタンを押して話し、もう一度押して送信 | Enterで送信
          </p>
        </div>
      </div>
    </div>
  );
}
