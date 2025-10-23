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
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-4">
        {/* Search and Filter Bar */}
        <Card padding="md">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="お客様名、住所で検索..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setFilterStatus('today')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                今日
              </button>
              <button
                onClick={() => setFilterStatus('week')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                今週
              </button>
              <button
                onClick={() => setFilterStatus('month')}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  filterStatus === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              size="md"
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
