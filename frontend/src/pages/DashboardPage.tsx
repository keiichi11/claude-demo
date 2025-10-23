/**
 * DashboardPage - Main dashboard with work order overview
 */

import React from 'react';
import { Calendar, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, Badge, Button, EmptyState, Skeleton } from '../components/ui';
import { useWorkStore } from '../stores/workStore';

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
}

function QuickStat({ icon, label, value, trend, color }: QuickStatProps) {
  return (
    <Card padding="md" className="flex items-center space-x-4">
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
      </div>
    </Card>
  );
}

interface WorkOrderCardProps {
  id: string;
  customerName: string;
  address: string;
  model: string;
  scheduledDate: string;
  status: string;
  onStart: () => void;
}

function WorkOrderCard({
  customerName,
  address,
  model,
  scheduledDate,
  status,
  onStart,
}: WorkOrderCardProps) {
  const statusVariant =
    status === 'completed'
      ? 'success'
      : status === 'in_progress'
      ? 'warning'
      : 'default';

  return (
    <Card padding="md" hover className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{customerName} 様</h3>
          <p className="text-sm text-gray-600 mt-1">{address}</p>
        </div>
        <Badge variant={statusVariant}>
          {status === 'completed'
            ? '完了'
            : status === 'in_progress'
            ? '作業中'
            : '予定'}
        </Badge>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{scheduledDate}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="font-medium">{model}</span>
        </div>
      </div>

      {status === 'scheduled' && (
        <Button onClick={onStart} variant="primary" fullWidth size="md">
          作業開始
        </Button>
      )}

      {status === 'in_progress' && (
        <Button onClick={onStart} variant="secondary" fullWidth size="md">
          作業を続ける
        </Button>
      )}
    </Card>
  );
}

export function DashboardPage() {
  const { workOrders, setWorkOrders } = useWorkStore();

  // Initialize mock data if empty
  React.useEffect(() => {
    if (workOrders.length === 0) {
      const mockOrders: any[] = [
        {
          id: '1',
          customer_name: '山田太郎',
          address: '東京都渋谷区〇〇1-2-3',
          model: 'CS-X400D2',
          scheduled_date: new Date().toISOString(),
          status: 'scheduled',
          quantity: 1,
        },
        {
          id: '2',
          customer_name: '佐藤花子',
          address: '東京都新宿区△△2-3-4',
          model: 'MSZ-ZW4021S',
          scheduled_date: new Date().toISOString(),
          status: 'in_progress',
          quantity: 1,
        },
        {
          id: '3',
          customer_name: '鈴木一郎',
          address: '東京都品川区□□3-4-5',
          model: 'RAS-X40L2',
          scheduled_date: new Date().toISOString(),
          status: 'scheduled',
          quantity: 1,
        },
      ];
      setWorkOrders(mockOrders);
    }
  }, [workOrders.length, setWorkOrders]);

  // Mock data for demonstration
  const todayOrders = workOrders.slice(0, 3);
  const todayCount = 5;
  const completedCount = 2;
  const avgTime = '2.5時間';

  const isLoading = false;

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} padding="md">
              <Skeleton height={80} />
            </Card>
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md">
              <Skeleton height={120} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">今日の概要</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickStat
              icon={<Calendar className="h-6 w-6 text-blue-600" />}
              label="今日の予定"
              value={todayCount}
              color="bg-blue-50"
            />
            <QuickStat
              icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
              label="完了"
              value={completedCount}
              color="bg-green-50"
            />
            <QuickStat
              icon={<Clock className="h-6 w-6 text-purple-600" />}
              label="平均作業時間"
              value={avgTime}
              color="bg-purple-50"
            />
            <QuickStat
              icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
              label="進捗率"
              value={`${Math.round((completedCount / todayCount) * 100)}%`}
              trend="+12% vs 先週"
              color="bg-orange-50"
            />
          </div>
        </section>

        {/* Upcoming Work Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">今日の作業予定</h2>
            <Button variant="ghost" size="sm">
              すべて表示
            </Button>
          </div>

          {todayOrders.length === 0 ? (
            <EmptyState
              icon="📅"
              title="今日の予定はありません"
              description="ゆっくり休んでください"
            />
          ) : (
            <div className="space-y-3">
              {todayOrders.map((order) => (
                <WorkOrderCard
                  key={order.id}
                  id={order.id}
                  customerName={order.customer_name}
                  address={order.address}
                  model={order.model}
                  scheduledDate={new Date(order.scheduled_date).toLocaleDateString(
                    'ja-JP'
                  )}
                  status={order.status}
                  onStart={() => {
                    console.log('Start work order:', order.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Reports */}
        <section className="pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">最近の作業報告</h2>
            <Button variant="ghost" size="sm">
              すべて表示
            </Button>
          </div>

          <Card padding="md">
            <EmptyState
              icon="📊"
              title="まだ作業報告がありません"
              description="作業を完了すると、ここに表示されます"
            />
          </Card>
        </section>
      </div>
    </div>
  );
}
