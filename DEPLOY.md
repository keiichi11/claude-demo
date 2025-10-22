# デプロイガイド

エアコン設置作業支援Chatbotのデプロイ手順

## 🚀 Docker Composeでのデプロイ

### 前提条件

- Docker Desktop がインストールされていること
- OpenAI APIキーを取得済みであること

### 1. 環境変数の設定

ルートディレクトリに `.env` ファイルを作成:

```bash
# .env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2. コンテナの起動

```bash
# すべてのサービスを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

起動するサービス:
- **PostgreSQL**: ポート5432
- **バックエンドAPI**: ポート8000
- **フロントエンド**: ポート3000

### 3. アクセス

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

### 4. 停止

```bash
# サービス停止
docker-compose down

# データも削除する場合
docker-compose down -v
```

## 📊 データベース初期化

データベースは初回起動時に自動的に作成されます。

### 手動でスキーマを適用する場合

```bash
# PostgreSQLコンテナに接続
docker-compose exec postgres psql -U postgres -d aircon_chatbot

# スキーマファイルを実行
\i /docker-entrypoint-initdb.d/schema.sql
```

### サンプルデータの確認

```sql
-- ユーザー一覧
SELECT * FROM users;

-- 作業案件一覧
SELECT * FROM work_orders;
```

## 🔧 開発モード

### バックエンドのみ起動

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .env ファイルを作成
cp .env.example .env
# OPENAI_API_KEYを設定

# サーバー起動
python app/main.py
```

### フロントエンドのみ起動

```bash
cd frontend
npm install

# .env ファイルを作成
cp .env.example .env

# 開発サーバー起動
npm run dev
```

## 🌐 本番環境デプロイ

### AWS ECS / Fargateへのデプロイ

1. **ECRにDockerイメージをプッシュ**

```bash
# AWSログイン
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com

# イメージビルド
docker-compose build

# タグ付け
docker tag aircon-chatbot-backend:latest <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/aircon-chatbot-backend:latest
docker tag aircon-chatbot-frontend:latest <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/aircon-chatbot-frontend:latest

# プッシュ
docker push <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/aircon-chatbot-backend:latest
docker push <account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/aircon-chatbot-frontend:latest
```

2. **RDS PostgreSQLのセットアップ**

- RDSインスタンス作成（PostgreSQL 15）
- セキュリティグループ設定
- DATABASE_URLを環境変数に設定

3. **ECS タスク定義**

```json
{
  "family": "aircon-chatbot-backend",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.ap-northeast-1.amazonaws.com/aircon-chatbot-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DATABASE_URL",
          "value": "postgresql+asyncpg://..."
        }
      ],
      "secrets": [
        {
          "name": "OPENAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:..."
        }
      ]
    }
  ]
}
```

4. **ALB（Application Load Balancer）設定**

- HTTPSリスナー設定
- ターゲットグループ作成
- ヘルスチェック設定

### Vercel / Netlify（フロントエンド）

1. **Vercelの場合**

```bash
cd frontend
npm install -g vercel
vercel

# 環境変数設定
vercel env add VITE_API_BASE_URL
```

2. **Netlifyの場合**

```bash
cd frontend
npm run build

# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

## 📦 環境変数一覧

### バックエンド

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|--------------|
| OPENAI_API_KEY | OpenAI APIキー | ✅ | - |
| DATABASE_URL | PostgreSQL接続URL | ✅ | postgresql+asyncpg://... |
| HOST | バインドホスト | - | 0.0.0.0 |
| PORT | バインドポート | - | 8000 |
| DEBUG | デバッグモード | - | True |

### フロントエンド

| 変数名 | 説明 | 必須 | デフォルト値 |
|--------|------|------|--------------|
| VITE_API_BASE_URL | バックエンドAPIのURL | ✅ | http://localhost:8000 |

## 🔒 セキュリティ

### 本番環境での注意事項

1. **APIキーの管理**
   - AWS Secrets Managerを使用
   - `.env`ファイルはGit管理外

2. **CORS設定**
   - `backend/app/main.py` でallow_originsを本番ドメインに限定

3. **データベース**
   - RDSのセキュリティグループで接続元を制限
   - SSL/TLS接続を有効化

4. **認証・認可**
   - JWT認証の実装（今後の拡張）
   - APIレート制限の設定

## 📊 モニタリング

### ログ確認

```bash
# Docker Composeの場合
docker-compose logs -f backend
docker-compose logs -f postgres

# 特定のサービス
docker-compose logs -f backend | grep ERROR
```

### ヘルスチェック

```bash
# バックエンド
curl http://localhost:8000/health

# データベース
docker-compose exec postgres pg_isready -U postgres
```

## 🐛 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLコンテナの状態確認
docker-compose ps postgres

# ログ確認
docker-compose logs postgres

# 再起動
docker-compose restart postgres
```

### ポート競合

```bash
# ポート使用状況確認
lsof -i :8000
lsof -i :3000
lsof -i :5432

# コンテナ停止
docker-compose down
```

### OpenAI API エラー

- APIキーが正しく設定されているか確認
- レート制限に達していないか確認
- 使用量クォータを確認

## 📝 メンテナンス

### データベースバックアップ

```bash
# バックアップ作成
docker-compose exec postgres pg_dump -U postgres aircon_chatbot > backup.sql

# リストア
docker-compose exec -T postgres psql -U postgres aircon_chatbot < backup.sql
```

### ログローテーション

```bash
# Docker のログサイズ制限
# docker-compose.yml に追加
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 🎯 次のステップ

- [ ] CI/CDパイプライン構築（GitHub Actions）
- [ ] 自動テストの追加
- [ ] パフォーマンス監視（Datadog, New Relic）
- [ ] エラートラッキング（Sentry）
- [ ] バックアップ自動化
