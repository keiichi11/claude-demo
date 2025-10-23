/**
 * AppHeader Component - Main application header
 */

import { Menu, Bell, User } from 'lucide-react';
import { Badge } from '../ui';

export interface AppHeaderProps {
  userName?: string;
  notificationCount?: number;
  onMenuClick?: () => void;
}

export function AppHeader({
  userName = 'ゲスト',
  notificationCount = 0,
  onMenuClick,
}: AppHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold">エアコン設置アシスタント</h1>
            <p className="text-xs text-blue-100">現場作業支援システム</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-blue-500 rounded-lg transition-colors"
            aria-label="通知"
          >
            <Bell className="h-6 w-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-blue-100">作業者</p>
            </div>
            <button
              className="p-2 bg-blue-500 hover:bg-blue-400 rounded-full transition-colors"
              aria-label="ユーザーメニュー"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
