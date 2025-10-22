/**
 * 作業報告タブコンポーネント
 * 写真撮影、使用部材入力、特記事項記録
 */

import { useState, useRef } from 'react';
import { useWorkStore } from '@/stores/workStore';
import { workPhotoApi, usedMaterialApi, workReportApi } from '@/services/api';

export function ReportTab() {
  const {
    currentWorkOrder,
    currentWorkReport,
    workPhotos,
    usedMaterials,
    addWorkPhoto,
    removeWorkPhoto,
    addUsedMaterial,
    removeUsedMaterial,
  } = useWorkStore();

  const [specialNotes, setSpecialNotes] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialQuantity, setMaterialQuantity] = useState('');
  const [materialUnit, setMaterialUnit] = useState('m');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // カメラで撮影
  const handleTakePhoto = () => {
    cameraInputRef.current?.click();
  };

  // ファイルから選択
  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  // 写真アップロード処理
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

    // inputをリセット
    event.target.value = '';
  };

  // 写真削除
  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('この写真を削除しますか？')) return;

    try {
      await workPhotoApi.deletePhoto(photoId);
      removeWorkPhoto(photoId);
    } catch (error) {
      console.error('写真削除エラー:', error);
      alert('写真の削除に失敗しました');
    }
  };

  // 使用部材追加
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

  // 使用部材削除
  const handleDeleteMaterial = async (materialId: string) => {
    try {
      await usedMaterialApi.deleteMaterial(materialId);
      removeUsedMaterial(materialId);
    } catch (error) {
      console.error('部材削除エラー:', error);
      alert('部材の削除に失敗しました');
    }
  };

  // 報告送信
  const handleSubmitReport = async () => {
    if (!currentWorkReport) return;

    if (workPhotos.length < 4) {
      alert('施工写真を最低4枚アップロードしてください');
      return;
    }

    if (!confirm('作業報告を送信しますか？')) return;

    setIsSubmitting(true);

    try {
      // 特記事項を更新
      await workReportApi.updateWorkReport(currentWorkReport.id, {
        special_notes: specialNotes,
      });

      // 報告を送信
      await workReportApi.submitWorkReport(currentWorkReport.id);

      alert('作業報告を送信しました');
    } catch (error) {
      console.error('報告送信エラー:', error);
      alert('報告の送信に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentWorkOrder) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        作業案件を選択してください
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">📋 基本情報</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">お客様:</span>
              <span className="font-semibold">{currentWorkOrder.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">住所:</span>
              <span>{currentWorkOrder.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">機種:</span>
              <span>{currentWorkOrder.model}</span>
            </div>
          </div>
        </div>

        {/* 施工写真 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">
            📷 施工写真 ({workPhotos.length}枚)
          </h2>

          {/* 写真グリッド */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {workPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.photo_url}
                  alt={photo.photo_type}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {photo.photo_type === 'before' && '施工前'}
                  {photo.photo_type === 'during' && '施工中'}
                  {photo.photo_type === 'after' && '施工後'}
                  {photo.photo_type === 'trouble' && 'トラブル'}
                </div>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* 撮影ボタン */}
          <div className="flex space-x-2">
            <button
              onClick={handleTakePhoto}
              className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              📷 カメラで撮影
            </button>
            <button
              onClick={handleSelectPhoto}
              className="flex-1 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              🖼️ ファイルから選択
            </button>
          </div>

          {/* Hidden file inputs */}
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
        </div>

        {/* 使用部材 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">🔧 使用部材</h2>

          {/* 部材リスト */}
          {usedMaterials.length > 0 && (
            <div className="mb-4 space-y-2">
              {usedMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div>
                    <span className="font-semibold">{material.material_name}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      {material.quantity} {material.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 部材追加フォーム */}
          <div className="space-y-2">
            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="部材名（例: 冷媒配管 2分3分）"
              className="w-full px-3 py-2 border rounded-lg"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                value={materialQuantity}
                onChange={(e) => setMaterialQuantity(e.target.value)}
                placeholder="数量"
                step="0.1"
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <select
                value={materialUnit}
                onChange={(e) => setMaterialUnit(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="m">m</option>
                <option value="個">個</option>
                <option value="本">本</option>
                <option value="セット">セット</option>
              </select>
              <button
                onClick={handleAddMaterial}
                disabled={!materialName || !materialQuantity}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
              >
                追加
              </button>
            </div>
          </div>
        </div>

        {/* 特記事項 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold text-lg mb-3">📝 特記事項</h2>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="トラブル、お客様からの要望、次回訪問が必要な事項などを記録..."
            rows={6}
            className="w-full px-3 py-2 border rounded-lg resize-none"
          />
        </div>

        {/* 送信ボタン */}
        <button
          onClick={handleSubmitReport}
          disabled={isSubmitting}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300"
        >
          {isSubmitting ? '送信中...' : '📤 作業報告を送信'}
        </button>
      </div>
    </div>
  );
}
