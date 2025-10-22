"""
FastAPI メインアプリケーション
エアコン設置作業支援Chatbot バックエンドAPI
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import chat

# FastAPIアプリケーション
app = FastAPI(
    title="エアコン設置作業支援Chatbot API",
    description="音声・テキストチャットによるエアコン設置作業支援システム",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS設定（フロントエンドからのアクセスを許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では具体的なドメインを指定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ルーター登録
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["chat"]
)


@app.get("/")
async def root():
    """
    ルートエンドポイント
    """
    return {
        "message": "エアコン設置作業支援Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """
    ヘルスチェック
    """
    return {"status": "ok"}


# エラーハンドリング
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    グローバル例外ハンドラ
    """
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 開発時のみ
        log_level="info"
    )
