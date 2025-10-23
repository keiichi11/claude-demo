# エアコン設置作業支援 Chatbot - Frontend

SaaSレベルのプロフェッショナルなUI/UXを提供するフロントエンドアプリケーション。

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **Zustand** - 軽量状態管理
- **Axios** - HTTPクライアント
- **Lucide React** - モダンアイコンライブラリ

## セットアップ

### 必要要件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# または
yarn install
```

### 開発サーバー起動

```bash
npm run dev

# または
yarn dev
```

ブラウザで http://localhost:3000 を開きます。

### ビルド

```bash
npm run build

# または
yarn build
```

ビルド成果物は `dist/` ディレクトリに生成されます。

## プロジェクト構造

```
frontend/
├── src/
│   ├── components/          # コンポーネント
│   │   ├── ui/             # 共通UIコンポーネント (Atomic Design)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── layout/         # レイアウトコンポーネント
│   │   │   ├── AppHeader.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── chat/           # チャット固有コンポーネント
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── VoiceButton.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/              # ページコンポーネント
│   │   ├── DashboardPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── ReportPage.tsx
│   │   └── RecordsPage.tsx
│   ├── stores/             # 状態管理
│   │   ├── workStore.ts
│   │   └── chatStore.ts
│   ├── services/           # API連携
│   │   └── api.ts
│   ├── types/              # 型定義
│   │   └── index.ts
│   ├── App.tsx             # ルートコンポーネント
│   ├── main.tsx            # エントリーポイント
│   └── index.css           # グローバルスタイル
├── public/                 # 静的ファイル
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 主要機能

### 1. ダッシュボード
- 今日の作業概要（予定件数、完了件数、平均作業時間）
- 作業予定一覧
- 最近の作業報告

### 2. AI対話機能
- テキストチャット
- 音声入力・音声出力
- 作業手順のガイダンス
- トラブルシューティング

### 3. 作業報告
- 施工写真アップロード（カメラ/ファイル選択）
- 使用部材の記録
- 特記事項の入力
- 下書き保存・報告送信

### 4. 作業記録
- 過去の作業履歴検索
- 期間別フィルタ
- CSVエクスポート

## デザインシステム

### カラーパレット

- **Primary**: #3b82f6 (Blue 600)
- **Success**: #10b981 (Green 600)
- **Warning**: #f59e0b (Amber 600)
- **Danger**: #ef4444 (Red 600)
- **Gray Scale**: #f9fafb ~ #111827

### タイポグラフィ

- **Base**: 16px
- **Font Family**: Inter, Noto Sans JP, system-ui
- **Line Height**: 1.5

### スペーシング

8px グリッドシステム（4px, 8px, 12px, 16px, 24px, 32px...）

## アクセシビリティ

- WCAG 2.1 AA準拠
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 最小タッチターゲット: 44x44px

## 環境変数

`.env` ファイルを作成して以下を設定:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## トラブルシューティング

### ビルドエラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 型エラー

```bash
# TypeScriptの型チェック
npm run build
```

## ライセンス

MIT
