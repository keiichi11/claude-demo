/**
 * メインアプリケーションコンポーネント
 */

import { useState } from 'react';
import { ChatTab } from './components/ChatTab';
import { ReportTab } from './components/ReportTab';
import { useWorkStore } from './stores/workStore';

type TabType = 'chat' | 'report' | 'records';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { currentWorkOrder } = useWorkStore();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🤖 エアコン設置アシスタント</h1>
            {currentWorkOrder && (
              <p className="text-sm opacity-90">{currentWorkOrder.customer_name} 様</p>
            )}
          </div>
          <div className="text-sm">
            <div className="font-semibold">作業者: 田中 一郎</div>
          </div>
        </div>
      </header>

      {/* タブナビゲーション */}
      <nav className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            💬 対話
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'report'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📸 報告
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 py-3 px-4 font-semibold transition-colors ${
              activeTab === 'records'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            📊 記録
          </button>
        </div>
      </nav>

      {/* タブコンテンツ */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'report' && <ReportTab />}
        {activeTab === 'records' && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <div className="text-xl font-semibold mb-2">作業記録</div>
              <div className="text-sm">作業履歴の表示機能は開発中です</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
