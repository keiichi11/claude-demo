# エアコン設置作業支援Chatbot - 要件定義書

## 1. プロジェクト概要

### 1.1 目的
エアコン設置事業者の現場作業者向けに、作業手順のガイド、音声での質問応答、作業報告の記録を一元的に行える音声Chatbotシステムを構築する。

### 1.2 対象ユーザー
- エアコン設置工事の現場作業者（電気工事士資格保有者）
- 現場監督・管理者
- 事務スタッフ（報告書確認用）

### 1.3 主要な価値提供
- ハンズフリーでの作業手順確認
- 経験の浅い作業者へのリアルタイムサポート
- 作業報告の効率化・標準化
- 作業履歴のデジタル化・検索可能化

---

## 2. 必要なドメイン知識

### 2.1 作業手順知識

#### 事前準備
- 工具チェックリスト（電動ドリル、コアドリル、トルクレンチ、真空ポンプ等）
- 部材確認（冷媒配管、ドレンホース、配線、スリーブ等）
- 安全装備確認（ヘルメット、安全帯、絶縁手袋等）
- お客様への挨拶・養生

#### 室内機設置
- 設置位置の決定（天井・壁からの離隔距離）
- 据付板の取り付け（水平確認）
- 配管穴あけ（壁内配線・配管の確認）
- スリーブ挿入
- 室内機本体の取り付け

#### 室外機設置
- 設置場所の確認（換気、騒音、メンテナンス性）
- 基礎ブロック・架台の設置（水平・荷重確認）
- 室外機の設置・固定

#### 配管工事
- 冷媒配管の接続（フレア加工、トルク管理）
- ドレン配管の接続（勾配確保）
- 電気配線（VVFケーブル接続、アース工事）
- 配管の保温・テーピング

#### 真空引き・試運転
- 真空ポンプによる真空引き（-0.1MPa以上、10分以上保持）
- 気密試験
- 冷媒バルブ開放
- 試運転（冷房・暖房動作確認）
- 温度測定

#### 仕上げ
- 配管化粧カバー取り付け
- 壁穴埋め・パテ処理
- 清掃
- お客様への操作説明
- 保証書・説明書の引き渡し

### 2.2 安全知識
- 高所作業時の安全帯使用義務
- 脚立・足場の安全基準
- 電気工事の感電防止（ブレーカーOFF確認）
- 冷媒ガス（R32等）の取扱い注意事項
- 重量物（室外機）の運搬時の腰痛予防

### 2.3 トラブルシューティング
- 真空引きで真空度が上がらない → フレアナット増し締め、バルブ確認
- 試運転で冷えない → 冷媒量、配管接続、バルブ開閉確認
- ドレン水が排水されない → 勾配確認、詰まり除去
- 異音発生 → 据付不良、配管共振の確認
- 配管が長さ不足 → 継手使用（原則避ける）、機器位置調整

### 2.4 法規制・基準
- 電気工事士法（第二種電気工事士以上の資格必要）
- フロン排出抑制法（冷媒の適正管理）
- 建築基準法（室外機の荷重、高さ制限）
- 騒音規制法（室外機の設置位置）

### 2.5 メーカー別仕様
- パナソニック、ダイキン、三菱電機、日立、東芝等
- メーカーごとの据付寸法、配管接続方法
- 専用工具の有無
- 施工要領書の参照

---

## 3. システム構成

### 3.1 AI構成

#### 音声認識・合成
- **音声入力**: Web Speech API (ブラウザ標準) / Google Speech-to-Text API
- **音声出力**: Web Speech API / Google Text-to-Speech API
- **ノイズキャンセリング**: ブラウザのMediaStream API活用
- **ハンズフリー対応**:
  - プッシュ・トゥ・トーク（ボタン押下）
  - ウェイクワード検出（オプション）

#### 対話AI
- **LLMエンジン**: Anthropic Claude API (Claude 3.5 Sonnet推奨)
- **代替**: OpenAI GPT-4 / Azure OpenAI
- **プロンプト設計**:
  - システムプロンプト: 作業者支援の専門家ペルソナ
  - コンテキスト: 現在の作業工程、機種情報
  - 安全に関する回答は慎重に（免責事項含む）

#### RAG（Retrieval-Augmented Generation）
- **ベクトルデータベース**: Pinecone / ChromaDB / Weaviate
- **エンベッディングモデル**: OpenAI text-embedding-3-small / Cohere Embed
- **検索対象データ**:
  - エアコン設置マニュアル（社内標準手順書）
  - メーカー別施工要領書（PDF）
  - 過去のトラブル事例とその対処法
  - 法規制・安全基準文書
- **検索フロー**:
  1. ユーザー質問をエンベッディング化
  2. ベクトルDB検索（Top-K=5程度）
  3. 検索結果をコンテキストとしてLLMに渡す
  4. LLMが回答生成

#### コンテキスト管理
- **セッション情報**:
  - 現在の案件ID（お客様名、住所、機種）
  - 作業工程の進捗状態
  - 対話履歴（直近10ターン程度）
- **永続化**: PostgreSQL
- **リアルタイム同期**: WebSocket

### 3.2 技術スタック

#### フロントエンド
- **フレームワーク**: React 18+
- **ビルドツール**: Vite
- **言語**: TypeScript
- **UIライブラリ**: Tailwind CSS + shadcn/ui
- **状態管理**: Zustand / Jotai
- **音声処理**: Web Speech API
- **PWA対応**: Workbox（Service Worker）
- **カメラ**: navigator.mediaDevices API

#### バックエンド
- **フレームワーク**: Python FastAPI
- **言語**: Python 3.11+
- **非同期処理**: asyncio / aiohttp
- **認証**: JWT (python-jose)
- **ファイルストレージ**: AWS S3 / MinIO
- **音声処理**: Google Cloud Speech-to-Text API

#### データベース
- **RDB**: PostgreSQL 15+（SQLAlchemy ORM）
- **ベクトルDB**: Pinecone / ChromaDB（RAG用）
- **キャッシュ**: Redis（セッション、頻繁アクセスデータ）

#### インフラ
- **クラウド**: AWS / Google Cloud Platform
- **コンテナ**: Docker / Docker Compose
- **Webサーバー**: Nginx（リバースプロキシ）
- **ASGI**: Uvicorn
- **CDN**: CloudFront / Cloudflare（画像・動画配信）
- **CI/CD**: GitHub Actions

---

## 4. 機能要件

### 4.1 音声対話機能

#### UC1: 作業手順の質問
- **入力**: 音声「この機種の室内機の取付位置は？」
- **処理**:
  1. 音声をテキスト化
  2. 現在の機種情報（CS-X400D2）を含めてLLMに質問
  3. RAGで該当機種の施工要領書を検索
  4. LLMが回答生成
- **出力**: 音声「CS-X400D2は天井から5cm以上、左右の壁から各10cm以上空けてください」

#### UC2: トラブル対応
- **入力**: 音声「真空引きで真空度が上がらない」
- **処理**: トラブルシューティングDBから類似事例を検索
- **出力**: 音声「以下を確認してください。1) フレアナット増し締め...」

#### UC3: 安全警告
- **入力**: 音声「室外機を屋根に設置する」
- **キーワード検出**: 「屋根」→ 高所作業
- **出力**: 音声「⚠️高所作業になります。安全帯の着用を確認してください」

### 4.2 作業手順チェックリスト

#### 機能
- 工程ごとのチェックリスト表示
- チェック完了時に自動で次工程へ
- 各工程の所要時間を自動記録
- 未完了項目の警告

#### データ構造
```json
{
  "steps": [
    {
      "id": "step_01",
      "name": "事前準備",
      "substeps": [
        { "id": "sub_01_01", "name": "工具チェック", "completed": true },
        { "id": "sub_01_02", "name": "部材確認", "completed": true }
      ],
      "status": "completed",
      "startTime": "2025-10-23T09:30:00Z",
      "endTime": "2025-10-23T09:45:00Z"
    }
  ]
}
```

### 4.3 作業報告機能

#### 報告項目
1. **基本情報** (自動入力)
   - 案件ID、お客様名、住所
   - 機種、台数
   - 作業日、作業者名

2. **作業時間** (自動計測)
   - 開始時刻（案件を開いた時点）
   - 終了時刻（報告送信時点）
   - 工程別所要時間

3. **施工写真** (カメラ撮影)
   - 施工前（既設状況）
   - 施工中（配管、配線）
   - 施工後（完成状態）
   - トラブル箇所（あれば）
   - 最低4枚、推奨8枚以上

4. **作業内容** (音声入力可)
   - 実施した工程（チェックリストから自動生成）
   - 特殊な施工（標準と異なる場合）

5. **使用部材** (音声入力可)
   - 部材名、数量、単位
   - 例: 「冷媒配管 2分3分 4m」

6. **特記事項** (音声入力可)
   - トラブル・対処内容
   - お客様からの要望・クレーム
   - 次回訪問が必要な事項

7. **お客様サイン** (タッチ入力)
   - Canvas APIでサイン描画
   - PNG画像として保存

#### 音声報告のフロー
```
作業者: 「作業報告を開始」
Bot: 「報告を開始します。何を記録しますか？」
作業者: 「壁に筋交いがあったので穴の位置を10センチ右にずらした」
Bot: 「特記事項に『壁内に筋交いあり、穴位置を10cm右にずらして施工』と記録しました。他にありますか？」
作業者: 「配管4メートル使用」
Bot: 「冷媒配管4mを使用部材に追加しました」
```

### 4.4 記録確認機能

#### 作業一覧
- 今日 / 今週 / 今月 / カスタム期間
- 案件ステータス別フィルタ（予定・作業中・完了）
- お客様名・住所での検索

#### 作業詳細
- 基本情報表示
- 工程別タイムライン
- 施工写真ギャラリー（拡大表示）
- 使用部材リスト
- 作業内容・特記事項
- 対話履歴（作業中の質問・回答）

#### エクスポート機能
- **PDF出力**: 報告書形式で印刷可能
- **メール送信**: 事務所・お客様へ送信
- **CSV出力**: 使用部材の集計用

### 4.5 オフライン対応

#### オフラインで可能な機能
- 作業手順チェックリストの閲覧
- 過去にキャッシュされたマニュアルの閲覧
- 写真撮影（ローカル保存）
- 作業報告の下書き保存

#### オンライン復帰時
- 下書き報告の自動アップロード
- 写真の自動同期
- 対話履歴の同期

---

## 5. 非機能要件

### 5.1 性能
- 音声認識の応答時間: 1秒以内
- LLM回答生成時間: 3秒以内
- 画面遷移: 0.5秒以内
- 同時接続ユーザー: 100名以上

### 5.2 セキュリティ
- **認証**: メールアドレス + パスワード / 指紋認証
- **通信**: HTTPS/TLS 1.3
- **データ暗号化**: AES-256（データベース、ファイルストレージ）
- **アクセス制御**: 作業者は自分の案件のみ閲覧可
- **秘密情報**:
  - `.env`ファイルに環境変数（APIキー等）を記載
  - `.env`はGit管理外（.gitignoreに追加）
  - 本番環境ではAWS Secrets Manager等のシークレット管理サービス使用

### 5.3 可用性
- 稼働率: 99.5%以上（月間ダウンタイム3.6時間以内）
- バックアップ: 日次自動バックアップ（7日間保持）

### 5.4 運用性
- ログ収集: アプリケーションログ、アクセスログ、エラーログ
- モニタリング: Grafana / CloudWatch
- アラート: エラー率5%超過時、応答時間5秒超過時

### 5.5 拡張性
- ユーザー数増加に対応（水平スケーリング）
- 他の設備工事（給湯器、換気扇等）への拡張を想定

---

## 6. UI/UX設計（SaaSプロダクションレベル）

### 6.1 設計原則

#### 6.1.1 プロダクトデザイン哲学
```
Core Principles:
1. モバイルファースト: 現場作業者の主要デバイスはスマートフォン
2. 片手操作: 手袋装着時、脚立上での操作を考慮
3. 高速レスポンス: ネットワークが不安定な環境での使用
4. プログレッシブディスクロージャー: 必要な情報を段階的に表示
5. エラー防止 > エラー回復: 誤操作を未然に防ぐUX
6. アクセシビリティ第一: WCAG 2.1 AAレベル準拠
```

#### 6.1.2 デザインシステム構築
```typescript
// カラーパレット（アクセシビリティ考慮）
const colors = {
  // Primary（CTA、重要アクション）
  primary: {
    50: '#eff6ff',   // 背景・ホバー
    100: '#dbeafe',
    500: '#3b82f6',  // メインブランドカラー（コントラスト比 4.5:1以上）
    600: '#2563eb',  // ホバー
    700: '#1d4ed8',  // アクティブ
    900: '#1e3a8a',
  },

  // Semantic Colors（状態表現）
  success: '#10b981',  // 完了、成功
  warning: '#f59e0b',  // 警告、注意
  danger: '#ef4444',   // エラー、削除
  info: '#06b6d4',     // 情報

  // Neutral（UI基本）
  gray: {
    50: '#f9fafb',   // 背景
    100: '#f3f4f6',  // カード背景
    200: '#e5e7eb',  // ボーダー
    400: '#9ca3af',  // 非活性テキスト
    600: '#4b5563',  // セカンダリテキスト
    900: '#111827',  // プライマリテキスト
  },

  // 現場用高視認性カラー
  highVisibility: {
    orange: '#ff6b00',  // 高所作業警告
    yellow: '#fbbf24',  // 注意喚起
  }
};

// タイポグラフィスケール
const typography = {
  fontFamily: {
    sans: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '12px',    // キャプション
    sm: '14px',    // ボディスモール
    base: '16px',  // ボディ（最小サイズ）
    lg: '18px',    // リード文
    xl: '20px',    // 小見出し
    '2xl': '24px', // セクション見出し
    '3xl': '30px', // ページタイトル
    '4xl': '36px', // ヒーロー
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
};

// スペーシングシステム（8px grid）
const spacing = {
  0: '0',
  1: '4px',    // 0.5 unit
  2: '8px',    // 1 unit
  3: '12px',   // 1.5 unit
  4: '16px',   // 2 unit
  5: '20px',   // 2.5 unit
  6: '24px',   // 3 unit
  8: '32px',   // 4 unit
  10: '40px',  // 5 unit
  12: '48px',  // 6 unit
  16: '64px',  // 8 unit
};

// シャドウシステム（奥行き表現）
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

// ボーダーラディウス
const borderRadius = {
  sm: '4px',   // 小要素（チップ、バッジ）
  md: '8px',   // ボタン、カード
  lg: '12px',  // モーダル、大カード
  xl: '16px',  // ヒーローセクション
  full: '9999px', // 円形（アバター、アイコンボタン）
};

// アニメーション定義
const animation = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
};
```

---

### 6.2 コンポーネント設計

#### 6.2.1 Atomic Design階層

##### Atoms（原子）
```
- Button (Primary, Secondary, Danger, Ghost, Icon)
- Input (Text, Number, Date, File)
- Textarea
- Select, Radio, Checkbox
- Badge（ステータス表示）
- Avatar（ユーザーアイコン）
- Icon（Lucide React使用）
- Spinner（ローディング）
- Skeleton（コンテンツプレースホルダー）
- Divider（区切り線）
- Tooltip
```

##### Molecules（分子）
```
- FormField (Label + Input + ErrorMessage)
- SearchBox (Input + Icon + ClearButton)
- FileUploadArea (DragDrop + Button + Preview)
- VoiceRecordButton (状態変化アニメーション付き)
- PhotoThumbnail (Image + DeleteButton + ZoomAction)
- MaterialInputRow (NameInput + QuantityInput + UnitSelect + AddButton)
- StepIndicator (進捗ステップ表示)
- ChatMessage (Avatar + Content + Timestamp)
- EmptyState (Icon + Message + Action)
```

##### Organisms（有機体）
```
- AppHeader (Logo + UserMenu + Notifications)
- NavigationBar (Tab Navigation)
- ChatInterface (MessageList + InputArea + VoiceButton)
- WorkOrderCard (Summary + Status + Actions)
- PhotoGallery (Grid + Upload + Lightbox)
- MaterialList (Table + AddForm + Total)
- ChecklistPanel (Steps + Progress + Timer)
- ReportFormSection (多段フォーム)
- FilterPanel (検索・フィルタUI)
```

##### Templates（テンプレート）
```
- DashboardLayout (Header + Navigation + Content + FAB)
- AuthLayout (Centered Card + Logo + Form)
- DetailLayout (BackButton + Header + ScrollableContent + FixedFooter)
- EmptyLayout (FullScreen EmptyState)
```

##### Pages（ページ）
```
- LoginPage
- DashboardPage
- WorkOrderListPage
- WorkOrderDetailPage
- ChatPage
- ReportPage
- RecordsPage
- SettingsPage
```

---

#### 6.2.2 主要コンポーネント詳細仕様

##### 6.2.2.1 Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  // アクセシビリティ
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

// 実装要件
- 最小タッチターゲットサイズ: 44x44px (Apple HIG準拠)
- ローディング状態でSpinner表示、テキスト保持（レイアウトシフト防止）
- disabled時はaria-disabled、フォーカス不可
- キーボードナビゲーション対応（Enter, Space）
- ホバー・アクティブ状態の明確なフィードバック
- Rippleエフェクト（Material Design風）
```

##### 6.2.2.2 VoiceRecordButton Component
```typescript
interface VoiceRecordButtonProps {
  onRecordStart: () => void;
  onRecordStop: (audioBlob: Blob) => void;
  disabled?: boolean;
  maxDuration?: number; // 最大録音時間（秒）
}

// UI状態遷移
Idle → Recording → Processing → Complete/Error

// ビジュアルフィードバック
- Idle: 🎤マイクアイコン、グレー
- Recording: 🔴録音中、赤パルスアニメーション、経過時間表示
- Processing: Spinner + 「認識中...」
- Error: ⚠️エラーメッセージ、再試行ボタン

// アクセシビリティ
- aria-live="polite" で状態変化を読み上げ
- 最大録音時間に達したら自動停止 + 音声フィードバック
```

##### 6.2.2.3 ChatInterface Component
```typescript
interface ChatInterfaceProps {
  messages: Message[];
  onSendText: (text: string) => Promise<void>;
  onSendVoice: (audio: Blob) => Promise<void>;
  isLoading: boolean;
  workOrderContext?: WorkOrder;
}

// レイアウト構造
<ChatInterface>
  <ContextHeader workOrder={context} />
  <MessageList>
    {messages.map(msg => (
      <ChatMessage
        role={msg.role}
        content={msg.content}
        timestamp={msg.timestamp}
        avatar={msg.role === 'user' ? userAvatar : aiAvatar}
      />
    ))}
    {isLoading && <TypingIndicator />}
    <div ref={scrollAnchor} />
  </MessageList>
  <InputArea>
    <TextInput onEnter={handleSend} />
    <SendButton disabled={!text && !isRecording} />
    <VoiceRecordButton />
  </InputArea>
</ChatInterface>

// UX改善
- 新メッセージ到着時、自動スクロール（スムーズアニメーション）
- ユーザーが手動スクロール中は自動スクロール無効化
- 「下にスクロール」FAB表示（新メッセージあり時）
- メッセージ入力中の下書き保存（localStorage）
- 送信失敗時の再試行UI
- コピー、共有アクション
```

##### 6.2.2.4 PhotoGallery Component
```typescript
interface PhotoGalleryProps {
  photos: Photo[];
  onUpload: (file: File, type: PhotoType) => Promise<void>;
  onDelete: (photoId: string) => Promise<void>;
  minPhotos?: number; // 最低枚数（検証用）
  maxPhotos?: number; // 最大枚数
}

// レイアウト
- Grid Layout (2列 on mobile, 3-4列 on tablet)
- Masonry Layout（縦横比が異なる場合）
- Drag & Drop対応（react-dropzone使用）
- ファイル選択 + カメラ直接起動の両対応

// 写真タイプ別UI
- 施工前（青ボーダー）
- 施工中（黄ボーダー）
- 施工後（緑ボーダー）
- トラブル（赤ボーダー）

// インタラクション
- サムネイルクリック → Lightbox表示（フルスクリーン）
- Lightbox内でスワイプナビゲーション
- ピンチズーム対応
- 削除確認モーダル（誤操作防止）
- アップロード進捗バー
- 画像圧縮（クライアント側、1MB以下に）

// アクセシビリティ
- alt属性に写真タイプ + 撮影日時
- キーボードナビゲーション（矢印キー）
```

---

### 6.3 画面構成（詳細）

#### 6.3.1 ログイン画面
```
Layout: AuthLayout（中央配置、背景グラデーション）

Components:
- Logo（アニメーション付き）
- LoginForm
  - EmailInput（バリデーション: RFC 5322）
  - PasswordInput（Show/Hide Toggle）
  - RememberMeCheckbox
  - LoginButton（ローディング状態）
  - ForgotPasswordLink
- ErrorAlert（ログイン失敗時）
- FooterLinks（利用規約、プライバシーポリシー）

UX:
- オートフォーカス（Email入力）
- Enter送信対応
- エラーメッセージ（フィールド下に表示）
- パスワードリセットフロー
- 生体認証対応（WebAuthn）
```

#### 6.3.2 ダッシュボード画面
```
Layout: DashboardLayout

Components:
1. AppHeader
   - ロゴ
   - 通知アイコン（未読バッジ）
   - ユーザーメニュー（アバター + ドロップダウン）

2. QuickStats（今日の作業サマリー）
   - 今日の予定件数
   - 完了件数
   - 平均作業時間
   - アニメーションカウンター

3. UpcomingWorkOrders
   - 今日・明日の予定リスト
   - カード形式（お客様名、住所、機種、開始時刻）
   - ステータスバッジ
   - 「作業開始」CTAボタン

4. RecentReports
   - 直近5件の作業報告
   - サムネイル + ステータス
   - 「詳細を見る」リンク

5. QuickActions（FAB Menu）
   - 新規案件作成
   - 作業報告開始
   - チャット起動

Interaction:
- Pull-to-Refresh（最新情報取得）
- Skeletonローディング
- Empty State（予定なし）
```

#### 6.3.3 作業案件一覧画面
```
Layout: DashboardLayout

Components:
1. SearchBar
   - キーワード検索（お客様名、住所）
   - 音声検索対応

2. FilterPanel
   - ステータスフィルタ（予定、作業中、完了）
   - 日付範囲フィルタ（Today, This Week, This Month, Custom）
   - ソート（日付、ステータス、お客様名）

3. WorkOrderList
   - 無限スクロール or ページネーション
   - カード形式
   - スワイプアクション（編集、削除）

4. WorkOrderCard
   - お客様名（太字）
   - 住所（アイコン + テキスト）
   - 機種（バッジ）
   - 予定日時
   - ステータスバッジ
   - 進捗インジケーター（作業中の場合）
   - アクションボタン

Interaction:
- カードタップ → 詳細画面
- スワイプ左 → 削除
- スワイプ右 → 編集
- 長押し → 複数選択モード
```

#### 6.3.4 チャット画面（作業支援対話）
```
Layout: DetailLayout（フルスクリーン）

Components:
1. ContextHeader
   - 戻るボタン
   - お客様名
   - 機種情報
   - 現在の工程バッジ

2. MessageList
   - 時系列表示（下が最新）
   - ユーザーメッセージ（右寄せ、青背景）
   - AIメッセージ（左寄せ、白背景）
   - タイムスタンプ（グループ化）
   - TypingIndicator（AI応答待ち）
   - SafetyWarningCard（警告時は目立つUI）

3. InputArea（下部固定）
   - TextInput（複数行対応、自動高さ調整）
   - SendButton
   - VoiceRecordButton
   - AttachmentButton（写真添付）

4. SuggestedQuestions（初回表示）
   - よくある質問チップ
   - タップで即送信

Interaction:
- メッセージ長押し → コピー
- AI回答に「いいね」「わかりにくい」フィードバック
- 音声再生ボタン（TTS）
- スクロール位置保持
```

#### 6.3.5 作業報告画面
```
Layout: DetailLayout

Components:
1. ProgressStepper（上部）
   - Step 1: 基本情報
   - Step 2: 施工写真
   - Step 3: 使用部材
   - Step 4: 特記事項
   - Step 5: 確認・送信

2. Step別フォーム
   【Step 1: 基本情報】
   - お客様名（自動入力、編集不可）
   - 作業日時（自動記録）
   - 作業時間（自動計算、手動調整可）
   - 作業内容サマリー（テキスト or 音声入力）

   【Step 2: 施工写真】
   - PhotoGallery
   - タイプ別アップロード（施工前・中・後・トラブル）
   - 最低4枚の検証
   - カメラ/ギャラリー選択

   【Step 3: 使用部材】
   - MaterialList
   - 追加フォーム（音声入力対応）
   - 合計数量表示

   【Step 4: 特記事項】
   - リッチテキストエディタ
   - 音声入力ボタン
   - テンプレート挿入（よくある記載事項）

   【Step 5: 確認・送信】
   - プレビュー（PDF風）
   - お客様サイン入力（Canvas）
   - 下書き保存 / 送信ボタン

Interaction:
- 各Stepでバリデーション
- 未入力項目にエラー表示
- 下書き自動保存（30秒毎）
- 送信前確認モーダル
- 送信成功アニメーション
```

#### 6.3.6 作業記録一覧画面
```
Layout: DashboardLayout

Components:
1. FilterBar
   - 期間フィルタ（Today, Week, Month, Custom）
   - ステータスフィルタ
   - エクスポートボタン（CSV, PDF）

2. RecordsList
   - カード or テーブル表示切替
   - お客様名、日付、ステータス、作業時間
   - サムネイル（施工写真1枚目）

3. RecordDetail（モーダル or 別画面）
   - 基本情報
   - 施工写真ギャラリー
   - 使用部材リスト
   - 特記事項
   - 対話履歴
   - お客様サイン
   - PDF出力ボタン
   - メール送信ボタン

Interaction:
- 検索（お客様名、住所）
- ソート（日付、作業時間）
- カードタップ → 詳細表示
- スワイプアクション（PDF出力、メール送信）
```

---

### 6.4 レスポンシブデザイン戦略

#### 6.4.1 ブレークポイント
```typescript
const breakpoints = {
  sm: '640px',   // スマートフォン（縦）
  md: '768px',   // タブレット（縦）
  lg: '1024px',  // タブレット（横）、小型ノートPC
  xl: '1280px',  // デスクトップ
  '2xl': '1536px', // 大型ディスプレイ
};

// 使用例
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### 6.4.2 デバイス別最適化

##### スマートフォン（< 640px）
- Single Column Layout
- フルスクリーンモーダル
- Bottom Sheet（下からスライドアップ）
- タブナビゲーション（画面下部）
- FAB（Floating Action Button）
- ハンバーガーメニュー

##### タブレット（640px - 1024px）
- Two Column Layout（一覧 + 詳細）
- Side Navigation（左サイドバー）
- Split View（iPad風）
- ポップオーバーモーダル

##### デスクトップ（> 1024px）
- Three Column Layout
- Persistent Navigation（常時表示）
- Hover Interactions
- Keyboard Shortcuts
- Context Menu（右クリック）

---

### 6.5 アクセシビリティ（WCAG 2.1 AA準拠）

#### 6.5.1 キーボードナビゲーション
```
- Tab順序の論理的な設定（tabindex管理）
- フォーカス可視化（2px solid outline）
- Skipリンク（「メインコンテンツへ」）
- Escape → モーダル閉じる
- Arrow Keys → リスト・タブナビゲーション
- Enter/Space → ボタン・リンク起動
```

#### 6.5.2 スクリーンリーダー対応
```typescript
// ARIA属性の適切な使用
<button
  aria-label="作業報告を送信"
  aria-describedby="report-submit-desc"
  aria-pressed={isPressed}
>
  送信
</button>

<div id="report-submit-desc" className="sr-only">
  作業報告を送信します。送信後は編集できません。
</div>

// ライブリージョン（動的コンテンツ変化の通知）
<div role="status" aria-live="polite" aria-atomic="true">
  {successMessage}
</div>

// ランドマーク
<header role="banner">...</header>
<nav role="navigation" aria-label="メインナビゲーション">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

#### 6.5.3 色覚多様性対応
```
- カラーだけに依存しない情報伝達
  例: エラー → 赤色 + アイコン + テキスト
- コントラスト比4.5:1以上（テキスト）
- コントラスト比3:1以上（UIコンポーネント）
- カラーブラインドシミュレーション（Chromatic使用）
```

#### 6.5.4 フォントサイズ・拡大対応
```
- 基準フォントサイズ16px以上
- rem単位使用（px禁止）
- 200%ズームでレイアウト崩れなし
- テキストのみ拡大設定対応
```

---

### 6.6 パフォーマンス最適化

#### 6.6.1 初期ロード最適化
```
- Code Splitting（React.lazy + Suspense）
- Route-based Splitting（ページ単位）
- Component-based Splitting（大型コンポーネント）
- Tree Shaking（未使用コード削除）
- Bundle Size予算設定（< 200KB初期バンドル）
- CSS-in-JS → 必要最小限のスタイルのみ
```

#### 6.6.2 画像最適化
```
- WebP形式優先（フォールバックJPEG）
- レスポンシブ画像（srcset, sizes）
- Lazy Loading（Intersection Observer）
- 画像圧縮（クライアント側）
  - 施工写真: 1920x1080、品質80%
  - サムネイル: 400x300、品質70%
- BlurHash Placeholder
```

#### 6.6.3 レンダリング最適化
```typescript
// 仮想スクロール（react-window）
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={workOrders.length}
  itemSize={80}
>
  {({ index, style }) => (
    <WorkOrderCard data={workOrders[index]} style={style} />
  )}
</FixedSizeList>

// メモ化
const MemoizedChatMessage = React.memo(ChatMessage, (prev, next) => {
  return prev.content === next.content && prev.timestamp === next.timestamp;
});

// useMemo, useCallback適切使用
const sortedOrders = useMemo(
  () => workOrders.sort((a, b) => b.scheduledDate - a.scheduledDate),
  [workOrders]
);
```

#### 6.6.4 ネットワーク最適化
```
- API Response Caching（React Query）
- Optimistic UI Update（楽観的更新）
- Request Batching
- Debounce/Throttle（検索入力）
- WebSocket（リアルタイム通知）
- Service Worker（オフライン対応）
```

---

### 6.7 アニメーション・インタラクションデザイン

#### 6.7.1 マイクロインタラクション
```css
/* ボタンホバー */
.button {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
.button:active {
  transform: translateY(0);
}

/* カード展開 */
@keyframes expand {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* スケルトンローディング */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

#### 6.7.2 ページ遷移アニメーション
```typescript
// Framer Motion使用
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    <Routes>...</Routes>
  </motion.div>
</AnimatePresence>
```

#### 6.7.3 フィードバックアニメーション
```
- 送信成功 → ✓チェックマーク展開 + グリーンフラッシュ
- 削除 → カード左スライドアウト + フェードアウト
- いいね → ハートバウンス
- エラー → シェイクアニメーション
- ローディング → スピナー or スケルトン
```

---

### 6.8 エラーハンドリング・ユーザーフィードバック

#### 6.8.1 エラー表示パターン
```typescript
// インラインエラー（フォームフィールド）
<FormField error="メールアドレスの形式が正しくありません" />

// トースト通知（一時的な成功・エラー）
<Toast
  type="error"
  message="ネットワークエラーが発生しました"
  action={{ label: '再試行', onClick: retry }}
  duration={5000}
/>

// フルページエラー（致命的エラー）
<ErrorBoundary
  fallback={
    <ErrorPage
      code={500}
      message="予期しないエラーが発生しました"
      action={{ label: 'ホームへ戻る', href: '/' }}
    />
  }
>
  <App />
</ErrorBoundary>

// Empty State（データなし）
<EmptyState
  icon={<InboxIcon />}
  title="作業案件がありません"
  description="新しい案件を作成してください"
  action={{ label: '案件を作成', onClick: createWorkOrder }}
/>
```

#### 6.8.2 プログレスフィードバック
```
- ボタンローディング（Spinner + 無効化）
- プログレスバー（ファイルアップロード）
- スケルトンスクリーン（初期ロード）
- インラインスピナー（データ更新）
- 楽観的UI更新（即座にUI反映、バックグラウンド同期）
```

---

### 6.9 テーマ・ダークモード対応

```typescript
// CSS Variables使用
:root {
  --color-background: #ffffff;
  --color-text-primary: #111827;
  --color-border: #e5e7eb;
}

[data-theme="dark"] {
  --color-background: #1f2937;
  --color-text-primary: #f9fafb;
  --color-border: #374151;
}

// React Context
const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// システム設定優先
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
```

---

### 6.10 実装優先順位

#### Phase 1: Core UI Foundation（1週間）
- デザインシステム構築（色、タイポグラフィ、スペーシング）
- Atomic Components（Button, Input, Card, etc.）
- Layout Templates
- Navigation Structure

#### Phase 2: Main Features（2週間）
- ダッシュボード
- 作業案件一覧・詳細
- チャット画面
- 作業報告画面（基本）

#### Phase 3: Advanced Features（1週間）
- 写真ギャラリー（Lightbox）
- 音声入力UI
- オフライン対応UI
- アニメーション

#### Phase 4: Polish & Optimization（1週間）
- アクセシビリティ改善
- パフォーマンス最適化
- レスポンシブ調整
- ダークモード

---

## 7. データ設計

### 7.1 主要テーブル

#### users (ユーザー)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- worker/manager/admin
  license_number VARCHAR(50), -- 電気工事士免状番号
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### work_orders (作業案件)
```sql
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  address TEXT NOT NULL,
  building_type VARCHAR(50), -- 戸建/マンション/店舗等
  model VARCHAR(50) NOT NULL, -- エアコン機種
  quantity INTEGER NOT NULL DEFAULT 1,
  scheduled_date DATE NOT NULL,
  worker_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- scheduled/in_progress/completed/cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### work_reports (作業報告)
```sql
CREATE TABLE work_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  work_duration DECIMAL(4,2), -- 作業時間（時間単位）
  work_content TEXT, -- 作業内容
  special_notes TEXT, -- 特記事項
  customer_signature_url TEXT, -- お客様サインのS3 URL
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft/submitted/approved
  submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### work_photos (施工写真)
```sql
CREATE TABLE work_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL, -- S3 URL
  photo_type VARCHAR(20) NOT NULL, -- before/during/after/trouble
  caption TEXT,
  taken_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### used_materials (使用部材)
```sql
CREATE TABLE used_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
  material_name VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL, -- m/個/本/セット等
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### work_steps (作業工程記録)
```sql
CREATE TABLE work_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_report_id UUID REFERENCES work_reports(id) ON DELETE CASCADE,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL, -- 工程の順序
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending/in_progress/completed/skipped
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### chat_history (対話履歴)
```sql
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- user/assistant
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 8. API設計

### 8.1 認証
```
POST   /api/auth/register          # ユーザー登録
POST   /api/auth/login             # ログイン
POST   /api/auth/logout            # ログアウト
GET    /api/auth/me                # 現在のユーザー情報取得
```

### 8.2 作業案件
```
POST   /api/work-orders            # 案件作成
GET    /api/work-orders            # 案件一覧取得（クエリパラメータ: status, date）
GET    /api/work-orders/:id        # 案件詳細取得
PATCH  /api/work-orders/:id        # 案件更新
DELETE /api/work-orders/:id        # 案件削除
```

### 8.3 作業報告
```
POST   /api/work-reports           # 報告作成
GET    /api/work-reports           # 報告一覧取得
GET    /api/work-reports/:id       # 報告詳細取得
PATCH  /api/work-reports/:id       # 報告更新
POST   /api/work-reports/:id/submit # 報告送信（ステータスをsubmittedに）
DELETE /api/work-reports/:id       # 報告削除
```

### 8.4 施工写真
```
POST   /api/work-photos            # 写真アップロード（multipart/form-data）
DELETE /api/work-photos/:id        # 写真削除
```

### 8.5 使用部材
```
POST   /api/used-materials         # 使用部材記録
PATCH  /api/used-materials/:id     # 使用部材更新
DELETE /api/used-materials/:id     # 使用部材削除
```

### 8.6 作業工程
```
POST   /api/work-steps             # 工程記録作成
PATCH  /api/work-steps/:id         # 工程ステータス更新
```

### 8.7 音声対話
```
POST   /api/chat                   # 音声対話（テキスト化済みのメッセージを送信）
                                   # Request: { workOrderId, message }
                                   # Response: { reply, context }
GET    /api/chat/:workOrderId      # 対話履歴取得
```

### 8.8 エクスポート
```
GET    /api/reports/pdf/:id        # PDF形式で報告書取得
POST   /api/reports/email/:id      # 報告書をメール送信
                                   # Request: { to, subject, message }
```

---

## 9. 実装フェーズ

### Phase 1: MVP（最小実用版） - 2ヶ月
**目標**: 基本的な音声対話と作業報告を可能にする

1. **ユーザー認証**: ログイン・ログアウト
2. **案件管理**: 案件一覧、案件詳細、案件作成
3. **音声対話**:
   - テキスト入力での質問（音声認識は後回し）
   - Claude APIでの回答生成
   - 簡易的なRAG（メーカーマニュアル3社分程度）
4. **作業手順チェックリスト**:
   - 固定の8工程チェックリスト
   - チェック完了の記録
5. **作業報告**:
   - テキストでの報告入力
   - 写真撮影・添付（4枚まで）
   - 報告の送信

**成果物**: ReactベースのPWA、FastAPIバックエンド

---

### Phase 2: 作業報告強化 - 1.5ヶ月
**目標**: 音声入力と報告機能の充実

6. **音声認識・合成**:
   - Web Speech APIの統合
   - プッシュ・トゥ・トーク実装
7. **音声報告入力**:
   - 特記事項、使用部材を音声で入力
   - 音声→テキスト変換後、確認画面表示
8. **使用部材管理**:
   - 部材マスタの作成
   - 部材の音声入力対応
9. **作業時間自動計測**:
   - 工程ごとの開始・終了時刻記録
   - 作業時間の自動集計
10. **報告一覧・検索**:
    - 期間別フィルタ
    - お客様名での検索
11. **お客様サイン機能**:
    - Canvas APIでのサイン入力

**成果物**: 音声対応版PWA、報告管理画面

---

### Phase 3: 高度な機能 - 2ヶ月
**目標**: オフライン対応と管理者機能

12. **PDF出力**:
    - ReportLabによる報告書PDF生成
    - レイアウトテンプレート作成
13. **メール送信**:
    - AWS SES連携
    - 報告書をメール添付
14. **オフライン対応**:
    - Service Workerでのキャッシング
    - IndexedDBでのローカル保存
    - オンライン復帰時の自動同期
15. **管理者ダッシュボード**:
    - 全作業者の作業状況確認
    - 日別・月別の作業集計
    - 使用部材の集計（在庫管理連携）
16. **RAG強化**:
    - メーカーマニュアル10社以上対応
    - 過去のトラブル事例を学習
    - 検索精度の改善

**成果物**: 完全版PWA、管理者向けWebダッシュボード

---

## 10. テスト計画

### 10.1 単体テスト
- フロントエンド: Vitest + React Testing Library
- バックエンド: pytest + pytest-asyncio
- カバレッジ目標: 80%以上

### 10.2 統合テスト
- API統合テスト: pytest + httpx
- E2Eテスト: Playwright

### 10.3 ユーザビリティテスト
- **対象**: 実際の作業者5名
- **シナリオ**:
  1. 新規案件の作業開始から報告送信まで
  2. 作業中のトラブル質問（音声）
  3. 過去の作業記録の検索
- **評価指標**:
  - タスク完了率
  - 所要時間
  - ユーザー満足度（5段階評価）

### 10.4 負荷テスト
- 同時接続100ユーザー
- 音声対話API: 100req/min
- 写真アップロード: 10MB x 10ファイル同時

---

## 11. リスク管理

### 11.1 技術リスク

| リスク | 影響 | 対策 |
|--------|------|------|
| 音声認識が現場騒音で機能しない | 高 | ノイズキャンセリング強化、テキスト入力併用 |
| LLMの回答が不正確で事故につながる | 高 | 重要な安全情報は確認済み情報のみ返答、免責事項明記 |
| 通信環境が悪い現場での使用 | 中 | オフライン機能の充実 |
| バッテリー消費が激しい | 中 | 音声認識の最適化、省電力モード |

### 11.2 セキュリティリスク

| リスク | 影響 | 対策 |
|--------|------|------|
| 個人情報・顧客情報の漏洩 | 高 | 暗号化、アクセス制御、定期的な脆弱性診断 |
| APIキーの流出 | 高 | 環境変数管理、AWS Secrets Manager使用 |
| 写真データの不正アクセス | 中 | S3バケットのアクセス制限、署名付きURL |

### 11.3 運用リスク

| リスク | 影響 | 対策 |
|--------|------|------|
| LLM APIの料金高騰 | 中 | 使用量モニタリング、キャッシング活用 |
| サーバーダウンで現場作業が止まる | 高 | オフライン機能、冗長化構成 |

---

## 12. 成功指標（KPI）

### 12.1 利用率
- 月間アクティブユーザー（MAU）: 作業者の80%以上
- 案件あたりの平均利用回数: 5回以上（質問・報告含む）

### 12.2 効率化
- 作業報告書作成時間: 従来比50%削減（30分 → 15分）
- 質問への回答取得時間: 従来比70%削減（電話で5分 → アプリで1.5分）

### 12.3 品質向上
- 施工ミス件数: 前年比30%削減
- お客様満足度: 4.5/5.0以上

### 12.4 ユーザー満足度
- アプリ評価: 4.0以上
- NPS（Net Promoter Score）: 50以上

---

## 13. 今後の拡張可能性

### 13.1 他の設備工事への展開
- 給湯器設置
- 換気扇設置
- IHクッキングヒーター設置
- アンテナ工事

### 13.2 予知保守
- 過去の施工データから故障リスクを予測
- お客様へのメンテナンス提案

### 13.3 AI画像認識
- 施工写真から不具合を自動検出
- 配管の勾配をカメラで測定

### 13.4 AR（拡張現実）
- スマホカメラで設置位置をシミュレーション
- 配管ルートをAR表示

---

## 付録A: 用語集

| 用語 | 説明 |
|------|------|
| フレア加工 | 冷媒配管の接続部を広げる加工（専用工具使用） |
| 真空引き | 配管内の空気・水分を真空ポンプで排出する作業 |
| 据付板 | 室内機を壁に固定するための金属プレート |
| スリーブ | 配管を通す穴に挿入する筒状の部材 |
| VVFケーブル | 屋内配線用の電気ケーブル（ビニル絶縁ビニルシースケーブル） |
| ドレン | エアコンから出る結露水 |
| R32 | エアコン用冷媒ガスの一種（微燃性） |

---

## 付録B: 参考資料

- 一般社団法人 日本冷凍空調設備工業連合会「ルームエアコン据付工事の手引き」
- 経済産業省「電気工事士法」
- 環境省「フロン排出抑制法」
- パナソニック「エアコン施工要領書」
- ダイキン「据付説明書」
