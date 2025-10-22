"""
チャットAPI エンドポイント
テキストチャット、音声チャット機能を提供
"""

import os
import tempfile
import uuid
from typing import List
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse

from app.models.chat import (
    TextChatRequest,
    TextChatResponse,
    VoiceChatResponse,
    HealthCheckResponse
)
from app.services.openai_service import get_openai_service, OpenAIService
from app.core.prompts import (
    build_system_prompt,
    build_chat_prompt,
    extract_safety_keywords,
    add_safety_reminder
)
from app.data.aircon_manuals import get_manual


router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    ヘルスチェック
    """
    openai_configured = bool(os.getenv("OPENAI_API_KEY"))

    return HealthCheckResponse(
        status="ok",
        version="1.0.0",
        openai_configured=openai_configured
    )


@router.post("/text", response_model=TextChatResponse)
async def text_chat(
    request: TextChatRequest,
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """
    テキストベースのチャット

    Args:
        request: チャットリクエスト
        openai_service: OpenAIサービス（DI）

    Returns:
        TextChatResponse: チャット応答
    """
    try:
        # マニュアルデータ取得
        manual_data = None
        if request.model:
            manual_data = get_manual(request.model)
            if not manual_data:
                raise HTTPException(
                    status_code=404,
                    detail=f"機種 {request.model} のマニュアルが見つかりません"
                )

        # システムプロンプト構築
        system_prompt = build_system_prompt(
            model=request.model,
            current_step=request.current_step,
            manual_data=manual_data
        )

        # メッセージリスト構築
        messages = build_chat_prompt(
            system_prompt=system_prompt,
            chat_history=request.chat_history,
            user_message=request.message
        )

        # GPT-4で応答生成
        result = await openai_service.chat_completion(
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )

        # 安全キーワード検出
        safety_keywords = extract_safety_keywords(request.message)

        # 安全リマインダー追加
        reply = add_safety_reminder(result.content, safety_keywords)

        return TextChatResponse(
            reply=reply,
            model_used=result.model,
            usage=result.usage,
            safety_warnings=safety_keywords
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice", response_model=VoiceChatResponse)
async def voice_chat(
    audio: UploadFile = File(..., description="音声ファイル（mp3, wav, m4a等）"),
    model: str = Form(None, description="エアコン機種名"),
    current_step: str = Form(None, description="現在の作業工程"),
    openai_service: OpenAIService = Depends(get_openai_service)
):
    """
    音声ベースのチャット

    Args:
        audio: アップロードされた音声ファイル
        model: エアコン機種名
        current_step: 現在の作業工程
        openai_service: OpenAIサービス（DI）

    Returns:
        VoiceChatResponse: 音声チャット応答
    """
    temp_audio_path = None
    temp_response_path = None

    try:
        # マニュアルデータ取得
        manual_data = None
        if model:
            manual_data = get_manual(model)

        # システムプロンプト構築
        system_prompt = build_system_prompt(
            model=model,
            current_step=current_step,
            manual_data=manual_data
        )

        # 一時ファイルに音声を保存
        suffix = Path(audio.filename).suffix or ".mp3"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_audio_path = temp_file.name

        # 音声→テキスト→チャット→音声の一連処理
        result = await openai_service.voice_to_voice_chat(
            audio_file_path=temp_audio_path,
            system_prompt=system_prompt,
            chat_history=[],  # TODO: データベースから取得
            temperature=0.7
        )

        # 安全キーワード検出
        safety_keywords = extract_safety_keywords(result["transcript"])

        # 安全リマインダー追加
        reply_text = add_safety_reminder(result["response_text"], safety_keywords)

        # 応答音声を一時ファイルに保存
        response_audio_id = str(uuid.uuid4())
        temp_response_path = f"/tmp/response_{response_audio_id}.mp3"

        with open(temp_response_path, "wb") as f:
            f.write(result["response_audio"])

        # 音声ファイルのURL（実際はS3等にアップロードすべき）
        audio_url = f"/api/v1/chat/audio/{response_audio_id}"

        return VoiceChatResponse(
            transcript=result["transcript"],
            reply=reply_text,
            audio_url=audio_url,
            model_used=result["model"],
            usage=result["usage"],
            safety_warnings=safety_keywords
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # 一時ファイルのクリーンアップ
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.unlink(temp_audio_path)


@router.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    """
    音声ファイルを取得

    Args:
        audio_id: 音声ファイルID

    Returns:
        音声ファイル
    """
    audio_path = f"/tmp/response_{audio_id}.mp3"

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="音声ファイルが見つかりません")

    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=f"response_{audio_id}.mp3"
    )


@router.get("/models")
async def get_available_models():
    """
    利用可能なエアコン機種一覧を取得

    Returns:
        機種リスト
    """
    from app.data.aircon_manuals import AIRCON_MANUALS

    models = []
    for model_name, manual in AIRCON_MANUALS.items():
        models.append({
            "model": model_name,
            "manufacturer": manual.get("manufacturer"),
            "series": manual.get("series"),
            "capacity": manual.get("capacity")
        })

    return {"models": models}
