/**
 * NavigationBar Component - マネーフォワード風のナビゲーション
 */

import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { MessageSquare, FileText, BarChart3, Home } from 'lucide-react';

export type TabType = 'dashboard' | 'chat' | 'report' | 'records';

export interface NavigationBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

interface NavItem {
  id: TabType;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'ホーム', icon: <Home className="h-5 w-5" /> },
  { id: 'chat', label: '対話', icon: <MessageSquare className="h-5 w-5" /> },
  { id: 'report', label: '報告', icon: <FileText className="h-5 w-5" /> },
  { id: 'records', label: '記録', icon: <BarChart3 className="h-5 w-5" /> },
];

export function NavigationBar({ activeTab, onTabChange }: NavigationBarProps) {
  return (
    <nav
      className="bg-white border-t border-gray-200 shadow-lg"
      role="navigation"
      aria-label="メインナビゲーション"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-around px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  'flex-1 flex flex-col items-center justify-center py-3 px-2',
                  'min-h-[72px] transition-all duration-200 relative',
                  'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500',
                  isActive
                    ? 'text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-b-full" />
                )}
                <div className="mb-1.5">{item.icon}</div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
