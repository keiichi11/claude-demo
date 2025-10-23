/**
 * TypingIndicator Component - Shows when AI is generating response
 */

import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
        <p className="text-xs text-gray-500 mb-2 font-medium">AI アシスタント</p>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          />
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          />
        </div>
      </div>
    </div>
  );
}
