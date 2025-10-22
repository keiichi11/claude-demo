"""
チャット関連のPydanticモデル
"""

from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class ChatMessage(BaseModel):
    """チャットメッセージ"""
    role: str = Field(..., description="メッセージの役割 (user/assistant)")
    content: str = Field(..., description="メッセージ内容")
    timestamp: Optional[datetime] = Field(default=None, description="タイムスタンプ")


class TextChatRequest(BaseModel):
    """テキストチャットリクエスト"""
    message: str = Field(..., description="ユーザーのメッセージ", min_length=1)
    model: Optional[str] = Field(default=None, description="エアコン機種名（例: CS-X400D2）")
    current_step: Optional[str] = Field(default=None, description="現在の作業工程")
    chat_history: Optional[List[Dict[str, str]]] = Field(
        default=[],
        description="対話履歴 [{'role': 'user', 'content': '...'}, ...]"
    )


class TextChatResponse(BaseModel):
    """テキストチャット応答"""
    reply: str = Field(..., description="AIの応答")
    model_used: str = Field(..., description="使用したAIモデル")
    usage: Dict[str, int] = Field(..., description="トークン使用量")
    safety_warnings: Optional[List[str]] = Field(
        default=[],
        description="検出された安全警告"
    )


class VoiceChatRequest(BaseModel):
    """音声チャットリクエスト（メタデータ）"""
    model: Optional[str] = Field(default=None, description="エアコン機種名")
    current_step: Optional[str] = Field(default=None, description="現在の作業工程")
    chat_history: Optional[List[Dict[str, str]]] = Field(
        default=[],
        description="対話履歴"
    )


class VoiceChatResponse(BaseModel):
    """音声チャット応答"""
    transcript: str = Field(..., description="音声認識結果（ユーザーの発話）")
    reply: str = Field(..., description="AIの応答テキスト")
    audio_url: str = Field(..., description="音声ファイルのURL")
    model_used: str = Field(..., description="使用したAIモデル")
    usage: Dict[str, int] = Field(..., description="トークン使用量")
    safety_warnings: Optional[List[str]] = Field(
        default=[],
        description="検出された安全警告"
    )


class HealthCheckResponse(BaseModel):
    """ヘルスチェック応答"""
    status: str = Field(..., description="ステータス")
    version: str = Field(..., description="APIバージョン")
    openai_configured: bool = Field(..., description="OpenAI API設定状態")
