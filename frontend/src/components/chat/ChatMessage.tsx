/**
 * ChatMessage Component - Individual chat message
 */

import { ReactNode } from 'react';
import { Bot, User } from 'lucide-react';
import { clsx } from 'clsx';

export interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={clsx(
        'flex gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
        </div>
      )}

      <div
        className={clsx(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white border border-gray-200 rounded-tl-none'
        )}
      >
        {!isUser && (
          <p className="text-xs text-gray-500 mb-1 font-medium">AI アシスタント</p>
        )}
        <p className="text-base whitespace-pre-wrap leading-relaxed">{content}</p>
        {timestamp && (
          <p
            className={clsx(
              'text-xs mt-2',
              isUser ? 'text-blue-100' : 'text-gray-500'
            )}
          >
            {timestamp.toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
}
