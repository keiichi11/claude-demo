/**
 * Main Application Component - SaaS Level UI
 * Redesigned with professional UX and modern design patterns
 */

import { useState } from 'react';
import { DashboardLayout, TabType } from './components/layout';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ReportPage } from './pages/ReportPage';
import { RecordsPage } from './pages/RecordsPage';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mock user data - will be replaced with actual auth
  const userName = '田中 一郎';
  const notificationCount = 2;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'chat':
        return <ChatPage />;
      case 'report':
        return <ReportPage />;
      case 'records':
        return <RecordsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={userName}
      notificationCount={notificationCount}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default App;
