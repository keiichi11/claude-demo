/**
 * RecordsPage - Work records list and search
 */

import { useState } from 'react';
import { Search, Filter, Calendar, Download } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Input } from '../components/ui';

export function RecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - will be replaced with real data
  const records: any[] = [];

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">作業記録</h1>
          <p className="text-sm text-gray-500">過去の作業履歴を検索・確認できます</p>
        </div>

        {/* Search and Filter Bar */}
        <Card padding="lg">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="お客様名、住所で検索..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all shadow-sm ${
                  filterStatus === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilterStatus('today')}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all shadow-sm ${
                  filterStatus === 'today'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                今日
              </button>
              <button
                onClick={() => setFilterStatus('week')}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all shadow-sm ${
                  filterStatus === 'week'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                今週
              </button>
              <button
                onClick={() => setFilterStatus('month')}
                className={`px-5 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all shadow-sm ${
                  filterStatus === 'month'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                今月
              </button>
            </div>

            {/* Export Button */}
            <Button
              variant="outline"
              leftIcon={<Download className="h-5 w-5" />}
              fullWidth
              size="lg"
              className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              CSVエクスポート
            </Button>
          </div>
        </Card>

        {/* Records List */}
        {records.length === 0 ? (
          <EmptyState
            icon="📊"
            title="作業記録がありません"
            description="作業を完了すると、ここに記録が表示されます"
          />
        ) : (
          <div className="space-y-3">
            {/* Record items will be mapped here */}
          </div>
        )}
      </div>
    </div>
  );
}
