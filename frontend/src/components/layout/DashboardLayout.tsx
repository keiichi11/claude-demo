/**
 * DashboardLayout Component - マネーフォワード風のレイアウト
 */

import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { NavigationBar, TabType } from './NavigationBar';

export interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  userName?: string;
  notificationCount?: number;
}

export function DashboardLayout({
  children,
  activeTab,
  onTabChange,
  userName,
  notificationCount,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#f7f9fa]">
      {/* Header */}
      <AppHeader
        userName={userName}
        notificationCount={notificationCount}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" role="main">
        {children}
      </main>

      {/* Bottom Navigation */}
      <NavigationBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
