# エアコン設置作業支援Chatbot - バックエンドAPI

OpenAI APIを活用した音声・テキストチャットによるエアコン設置作業支援システムのバックエンド実装。

## 🎯 主要機能

- **音声認識 (STT)**: OpenAI Whisper APIによる日本語音声認識
- **音声合成 (TTS)**: OpenAI TTS APIによる自然な日本語音声生成
- **対話AI**: GPT-4oによる作業手順・トラブルシューティング支援
- **詳細マニュアル**: パナソニック、ダイキン、三菱電機の主要機種データ内蔵
- **安全警告**: 高所作業、電気工事等の危険な作業を自動検出して警告

## 🏗 AIアーキテクチャ

### システム構成

```
[ユーザー音声]
    ↓
[Whisper API] → テキスト化
    ↓
[プロンプトエンジニアリング]
  - システムプロンプト（専門家ペルソナ）
  - マニュアルデータ（機種別詳細仕様）
  - 対話履歴
  - 安全警告ルール
    ↓
[GPT-4o API] → 回答生成
    ↓
[安全キーワード検出] → 警告追加
    ↓
[TTS API] → 音声化
    ↓
[音声レスポンス]
```

### 採用技術

| 機能 | 技術 | モデル/API |
|------|------|-----------|
| 音声認識 | OpenAI Whisper | whisper-1 |
| 音声合成 | OpenAI TTS | tts-1 (alloy voice) |
| 対話生成 | OpenAI GPT-4 | gpt-4o |
| バックエンド | FastAPI | Python 3.11+ |

### RAGの代わりにプロンプトベース方式を採用

本システムでは、ベクトルDBを使ったRAG（Retrieval-Augmented Generation）ではなく、**システムプロンプトに詳細なマニュアル情報を直接埋め込む方式**を採用しています。

**理由:**
- 機種数が限定的（3機種）でデータ量が管理可能
- プロンプト内に全情報を含めることでレイテンシ削減
- ベクトルDB不要でインフラがシンプル
- GPT-4oの長いコンテキストウィンドウ（128K tokens）を活用

**マニュアルデータの詳細度:**
- 室内機/室外機の寸法、重量、設置基準
- 配管仕様（サイズ、トルク、フレア加工手順）
- 真空引き手順（9ステップの詳細）
- 試運転手順（冷房/暖房の確認項目）
- トラブルシューティング（原因と対処法）
- 安全警告（電気工事、高所作業、冷媒取扱い）

## 📁 ディレクトリ構成

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── chat.py              # チャットAPIエンドポイント
│   ├── services/
│   │   └── openai_service.py        # OpenAI API連携サービス
│   ├── core/
│   │   └── prompts.py               # プロンプトエンジニアリング
│   ├── data/
│   │   └── aircon_manuals.py        # エアコンマニュアルデータ
│   ├── models/
│   │   └── chat.py                  # Pydanticモデル
│   └── main.py                      # FastAPIメインアプリ
├── test_api.py                      # API動作確認スクリプト
├── requirements.txt                 # Python依存パッケージ
├── .env.example                     # 環境変数サンプル
└── README.md                        # このファイル
```

## 🚀 セットアップ

### 1. 依存パッケージのインストール

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 環境変数の設定

`.env.example` をコピーして `.env` を作成:

```bash
cp .env.example .env
```

`.env` ファイルを編集してOpenAI APIキーを設定:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 3. サーバー起動

```bash
# 開発モード（自動リロード有効）
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# または
python app/main.py
```

サーバーが起動したら以下にアクセス:
- API: http://localhost:8000
- APIドキュメント: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 動作確認

### テストスクリプト実行

```bash
python test_api.py
```

実行内容:
1. 利用可能な機種一覧の表示
2. テキストチャットのテスト（3つの質問）
3. 音声合成のテスト（MP3ファイル生成）

### curlでのテスト

#### 1. ヘルスチェック

```bash
curl http://localhost:8000/api/v1/chat/health
```

#### 2. テキストチャット

```bash
curl -X POST http://localhost:8000/api/v1/chat/text \
  -H "Content-Type: application/json" \
  -d '{
    "message": "この機種の室内機の取付位置は？",
    "model": "CS-X400D2",
    "current_step": "室内機設置"
  }'
```

#### 3. 利用可能な機種一覧

```bash
curl http://localhost:8000/api/v1/chat/models
```

#### 4. 音声チャット

```bash
curl -X POST http://localhost:8000/api/v1/chat/voice \
  -F "audio=@your_audio_file.mp3" \
  -F "model=CS-X400D2"
```

## 📡 APIエンドポイント

### `GET /api/v1/chat/health`
ヘルスチェック

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "openai_configured": true
}
```

### `POST /api/v1/chat/text`
テキストベースのチャット

**Request:**
```json
{
  "message": "室内機の取付高さは？",
  "model": "CS-X400D2",
  "current_step": "室内機設置",
  "chat_history": []
}
```

**Response:**
```json
{
  "reply": "CS-X400D2の室内機は床から2.0m推奨です...",
  "model_used": "gpt-4o",
  "usage": {
    "prompt_tokens": 1234,
    "completion_tokens": 56,
    "total_tokens": 1290
  },
  "safety_warnings": []
}
```

### `POST /api/v1/chat/voice`
音声ベースのチャット

**Request (multipart/form-data):**
- `audio`: 音声ファイル（mp3, wav, m4a等）
- `model`: エアコン機種名（オプション）
- `current_step`: 現在の作業工程（オプション）

**Response:**
```json
{
  "transcript": "真空引きで真空度が上がらない",
  "reply": "真空度が上がらない主な原因は3つです...",
  "audio_url": "/api/v1/chat/audio/uuid",
  "model_used": "gpt-4o",
  "usage": {...},
  "safety_warnings": ["冷媒"]
}
```

### `GET /api/v1/chat/models`
利用可能な機種一覧

**Response:**
```json
{
  "models": [
    {
      "model": "CS-X400D2",
      "manufacturer": "パナソニック",
      "series": "Eolia Xシリーズ",
      "capacity": "14畳用（4.0kW）"
    },
    ...
  ]
}
```

## 🔧 対応機種

| 機種名 | メーカー | シリーズ | 能力 |
|--------|---------|---------|------|
| CS-X400D2 | パナソニック | Eolia X | 4.0kW (14畳) |
| AN40ZRP | ダイキン | うるさらX | 4.0kW (14畳) |
| MSZ-ZW4022S | 三菱電機 | 霧ヶ峰 Z | 4.0kW (14畳) |

各機種の詳細情報:
- 室内機/室外機の寸法・重量・設置基準
- 配管仕様（サイズ、トルク、フレア加工）
- 真空引き手順
- 試運転手順
- トラブルシューティング
- 安全警告

## 🛡️ 安全機能

システムは以下のキーワードを検出し、自動的に安全警告を追加します:

- **高所作業**: 「屋根」「はしご」「脚立」等 → 安全帯着用警告
- **電気工事**: 「電気」「配線」「ブレーカー」等 → 感電防止警告
- **冷媒取扱い**: 「冷媒」「ガス」「R32」等 → 火気厳禁警告
- **重量物**: 「室外機」「運搬」等 → 2名作業・腰痛予防警告

## 💰 コスト試算（月間100リクエスト想定）

| API | 使用量 | 単価 | 月額 |
|-----|--------|------|------|
| Whisper | 100分 | $0.006/分 | $0.6 |
| TTS | 10,000文字 | $15/1M文字 | $0.15 |
| GPT-4o | 500K tokens | Input $2.5/1M, Output $10/1M | 約$5 |
| **合計** | | | **約$6/月** |

※実際のコストは使用量により変動します

## 📝 開発メモ

### プロンプトエンジニアリングのポイント

1. **専門家ペルソナ**: 「エアコン設置工事の専門AIアシスタント」として振る舞う
2. **簡潔な回答**: 音声で聞き取りやすいよう3文以内を目標
3. **具体的な数値**: 「天井から50mm以上」等、曖昧な表現を避ける
4. **安全最優先**: 危険な作業には必ず警告を含める
5. **マニュアル準拠**: 推測せず、提供されたマニュアル情報に基づく

### 今後の拡張予定

- [ ] 対話履歴のデータベース永続化
- [ ] S3への音声ファイル保存
- [ ] 作業報告機能との連携
- [ ] 対応機種の追加（10機種以上）
- [ ] 音声認識精度の向上（現場騒音対策）

## 📄 ライセンス

このプロジェクトは開発中のプロトタイプです。
