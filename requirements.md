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

## 6. UI設計

### 6.1 画面構成（タブ方式）

#### タブ1: 💬対話
- 音声対話のメイン画面
- チャット履歴表示
- 🎤ボタン（プッシュ・トゥ・トーク）
- 現在の案件情報（上部に常時表示）

#### タブ2: 📋作業
- 作業手順チェックリスト
- 工程の進捗表示
- 各工程の詳細手順
- 写真撮影ボタン

#### タブ3: 📸報告
- 作業報告入力フォーム
- 施工写真アップロード
- 音声入力ボタン（各フィールドに配置）
- 使用部材入力
- お客様サイン欄
- 下書き保存 / 報告送信ボタン

#### タブ4: 📊記録
- 作業一覧（期間別、ステータス別）
- 検索フィルタ
- 作業詳細へのリンク

### 6.2 レスポンシブデザイン
- スマートフォン（縦持ち）を主要デバイスとする
- タブレット（横持ち）でも利用可能
- フォントサイズ: 16px以上（現場での視認性確保）
- ボタンサイズ: 44x44px以上（手袋装着時でもタップ可能）

### 6.3 アクセシビリティ
- 音声読み上げ対応（視覚障害者対応）
- ハイコントラストモード
- フォントサイズ変更機能

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
