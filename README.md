# 🤖 エアコン設置作業支援Chatbot

OpenAI APIを活用した、エアコン設置工事の現場作業者向け音声・テキストチャットシステム

## 📋 プロジェクト概要

エアコン設置作業者が現場で直面する課題を解決するための総合支援システムです。

### 主要機能

1. **💬 音声・テキスト対話AI**
   - OpenAI Whisper による日本語音声認識
   - GPT-4o による作業手順・トラブルシューティング支援
   - OpenAI TTS による自然な音声応答
   - ハンズフリー操作対応

2. **📸 作業報告機能**
   - カメラで施工写真を撮影・保存
   - 使用部材の音声入力・記録
   - 特記事項の記録
   - 報告書の自動生成

3. **📊 作業記録管理**
   - 案件ごとの作業履歴
   - 対話履歴の保存
   - 写真・部材使用量の記録

4. **⚠️ 安全警告**
   - 高所作業、電気工事等の危険作業を自動検出
   - リアルタイムで安全注意喚起

## 🎯 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS** (スタイリング)
- **Zustand** (状態管理)
- **Web Speech API** (音声認識・合成)

### バックエンド
- **Python 3.11** + **FastAPI**
- **OpenAI API** (Whisper, GPT-4o, TTS)
- **PostgreSQL 15** (データベース)
- **SQLAlchemy** + **Asyncpg**

### インフラ
- **Docker** + **Docker Compose**

## 🚀 クイックスタート

### 前提条件
- Docker Desktop インストール済み
- OpenAI APIキー取得済み

### 起動手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-username/claude-demo.git
cd claude-demo

# 2. 環境変数設定
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# 3. Docker Composeで起動
docker-compose up -d

# 4. アクセス
# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:8000
# APIドキュメント: http://localhost:8000/docs
```

## 📖 詳細ドキュメント

- [requirements.md](requirements.md) - 要件定義書
- [DEPLOY.md](DEPLOY.md) - デプロイガイド
- [backend/README.md](backend/README.md) - バックエンドAPI仕様

## 💰 コスト試算

月間100ユーザー想定で約$51/月（OpenAI API + AWS）

## 📄 ライセンス

開発中のプロトタイプ

---

🤖 Powered by OpenAI GPT-4o, Whisper, TTS
