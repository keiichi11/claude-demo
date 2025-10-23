/**
 * ReportPage - Improved work report interface
 */

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Plus, Send, Save } from 'lucide-react';
import { Card, Button, Input, Badge, EmptyState } from '../components/ui';
import { useWorkStore } from '../stores/workStore';
import { workPhotoApi, usedMaterialApi, workReportApi } from '../services/api';
import { clsx } from 'clsx';

interface PhotoItemProps {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after' | 'trouble';
  onDelete: () => void;
}

function PhotoItem({ url, type, onDelete }: PhotoItemProps) {
  const typeColors = {
    before: 'border-blue-400 bg-blue-50',
    during: 'border-emerald-400 bg-emerald-50',
    after: 'border-teal-400 bg-teal-50',
    trouble: 'border-orange-400 bg-orange-50',
  };

  const typeLabels = {
    before: '施工前',
    during: '施工中',
    after: '施工後',
    trouble: 'トラブル',
  };

  return (
    <div className="relative group">
      <div className={clsx('rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow', typeColors[type])}>
        <img src={url} alt={typeLabels[type]} className="w-full h-36 object-cover" />
        <div className="absolute top-2 left-2">
          <Badge size="sm">{typeLabels[type]}</Badge>
        </div>
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
          aria-label="写真を削除"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ReportPage() {
  const {
    workOrders,
    currentWorkOrder,
    currentWorkReport,
    workPhotos,
    usedMaterials,
    setCurrentWorkOrder,
    setCurrentWorkReport,
    addWorkPhoto,
    removeWorkPhoto,
    addUsedMaterial,
    removeUsedMaterial,
  } = useWorkStore();

  // Initialize with first work order if available and no current order
  React.useEffect(() => {
    if (!currentWorkOrder && workOrders.length > 0) {
      setCurrentWorkOrder(workOrders[0]);
      // Create a mock work report
      setCurrentWorkReport({
        id: 'report-1',
        work_order_id: workOrders[0].id,
        status: 'draft',
      });
    }
  }, [currentWorkOrder, workOrders, setCurrentWorkOrder, setCurrentWorkReport]);

  const [specialNotes, setSpecialNotes] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');
  const [materialUnit, setMaterialUnit] = useState('m');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo upload
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    photoType: 'before' | 'during' | 'after' | 'trouble'
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentWorkReport) return;

    const file = files[0];

    try {
      const photo = await workPhotoApi.uploadPhoto(
        currentWorkReport.id,
        file,
        photoType
      );
      addWorkPhoto(photo);
    } catch (error) {
      console.error('写真アップロードエラー:', error);
      alert('写真のアップロードに失敗しました');
    }

    event.target.value = '';
  };

  // Material management
  const handleAddMaterial = async () => {
    if (!materialName || !materialQuantity || !currentWorkReport) return;

    try {
      const material = await usedMaterialApi.addMaterial({
        work_report_id: currentWorkReport.id,
        material_name: materialName,
        quantity: parseFloat(materialQuantity),
        unit: materialUnit,
      });

      addUsedMaterial(material);
      setMaterialName('');
      setMaterialQuantity('');
    } catch (error) {
      console.error('部材追加エラー:', error);
      alert('部材の追加に失敗しました');
    }
  };

  // Submit report
  const handleSubmitReport = async () => {
    if (!currentWorkReport) return;

    if (workPhotos.length < 4) {
      alert('施工写真を最低4枚アップロードしてください');
      return;
    }

    if (!confirm('作業報告を送信しますか？送信後は編集できません。')) return;

    setIsSubmitting(true);

    try {
      await workReportApi.updateWorkReport(currentWorkReport.id, {
        special_notes: specialNotes,
      });

      await workReportApi.submitWorkReport(currentWorkReport.id);

      alert('✓ 作業報告を送信しました');
    } catch (error) {
      console.error('報告送信エラー:', error);
      alert('報告の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!currentWorkReport) return;

    try {
      await workReportApi.updateWorkReport(currentWorkReport.id, {
        special_notes: specialNotes,
      });
      alert('✓ 下書きを保存しました');
    } catch (error) {
      console.error('下書き保存エラー:', error);
      alert('下書きの保存に失敗しました');
    }
  };

  if (!currentWorkOrder) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f7f9fa]">
        <EmptyState
          icon="📋"
          title="作業案件を選択してください"
          description="ダッシュボードから作業を開始すると、報告を作成できます"
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#f7f9fa]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 pb-32">
        {/* Basic Info */}
        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <span className="mr-2">📋</span>
            基本情報
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">お客様</span>
              <span className="font-bold text-gray-900">{currentWorkOrder.customer_name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">住所</span>
              <span className="text-sm text-right text-gray-700">{currentWorkOrder.address}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500 font-medium">機種</span>
              <Badge variant="info">{currentWorkOrder.model}</Badge>
            </div>
          </div>
        </Card>

        {/* Photos */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">📷</span>
              施工写真
              <Badge variant="default" className="ml-3">
                {workPhotos.length}枚
              </Badge>
            </h2>
            {workPhotos.length < 4 && (
              <Badge variant="warning">最低4枚必要</Badge>
            )}
          </div>

          {workPhotos.length === 0 ? (
            <EmptyState
              icon="📸"
              title="まだ写真がありません"
              description="カメラで撮影、またはファイルから選択してください"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {workPhotos.map((photo) => (
                <PhotoItem
                  key={photo.id}
                  id={photo.id}
                  url={photo.photo_url}
                  type={photo.photo_type}
                  onDelete={async () => {
                    if (confirm('この写真を削除しますか？')) {
                      try {
                        await workPhotoApi.deletePhoto(photo.id);
                        removeWorkPhoto(photo.id);
                      } catch (error) {
                        alert('写真の削除に失敗しました');
                      }
                    }
                  }}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              variant="primary"
              leftIcon={<Camera className="h-5 w-5" />}
              fullWidth
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
            >
              カメラ
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="secondary"
              leftIcon={<Upload className="h-5 w-5" />}
              fullWidth
              size="lg"
              className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              ファイル
            </Button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e, 'during')}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoUpload(e, 'during')}
          />
        </Card>

        {/* Materials */}
        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <span className="mr-2">🔧</span>
            使用部材
          </h2>

          {usedMaterials.length > 0 && (
            <div className="mb-5 space-y-3">
              {usedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{material.material_name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {material.quantity} {material.unit}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await usedMaterialApi.deleteMaterial(material.id);
                        removeUsedMaterial(material.id);
                      } catch (error) {
                        alert('部材の削除に失敗しました');
                      }
                    }}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="部材名"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="例: 冷媒配管 2分3分"
            />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="数量"
                  type="number"
                  step="0.1"
                  value={materialQuantity}
                  onChange={(e) => setMaterialQuantity(e.target.value)}
                  placeholder="4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  単位
                </label>
                <select
                  value={materialUnit}
                  onChange={(e) => setMaterialUnit(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                >
                  <option value="m">m</option>
                  <option value="個">個</option>
                  <option value="本">本</option>
                  <option value="セット">セット</option>
                </select>
              </div>
            </div>
            <Button
              onClick={handleAddMaterial}
              disabled={!materialName || !materialQuantity}
              variant="secondary"
              leftIcon={<Plus className="h-5 w-5" />}
              fullWidth
              size="lg"
              className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
            >
              部材を追加
            </Button>
          </div>
        </Card>

        {/* Special Notes */}
        <Card padding="lg">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center">
            <span className="mr-2">📝</span>
            特記事項
          </h2>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="トラブル、お客様からの要望、次回訪問が必要な事項などを記録..."
            rows={6}
            className="w-full px-5 py-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
          />
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 space-y-3">
          <Button
            onClick={handleSaveDraft}
            variant="secondary"
            leftIcon={<Save className="h-5 w-5" />}
            fullWidth
            size="lg"
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            下書き保存
          </Button>
          <Button
            onClick={handleSubmitReport}
            variant="primary"
            leftIcon={<Send className="h-5 w-5" />}
            fullWidth
            size="lg"
            loading={isSubmitting}
            disabled={workPhotos.length < 4}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md"
          >
            作業報告を送信
          </Button>
        </div>
      </div>
    </div>
  );
}
