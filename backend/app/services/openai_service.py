"""
OpenAI API連携サービス
Whisper (音声認識), TTS (音声合成), GPT-4 (対話) を統合
"""

import os
import asyncio
from typing import List, Dict, Optional
from pathlib import Path
import tempfile

from openai import AsyncOpenAI
from pydantic import BaseModel


class TranscriptionResult(BaseModel):
    """音声認識結果"""
    text: str
    language: str
    duration: Optional[float] = None


class ChatCompletionResult(BaseModel):
    """チャット応答結果"""
    content: str
    model: str
    usage: Dict[str, int]
    finish_reason: str


class TTSResult(BaseModel):
    """音声合成結果"""
    audio_data: bytes
    format: str = "mp3"


class OpenAIService:
    """OpenAI API統合サービス"""

    def __init__(self, api_key: str = None):
        """
        初期化

        Args:
            api_key: OpenAI APIキー（環境変数OPENAI_API_KEYから取得可能）
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not set")

        self.client = AsyncOpenAI(api_key=self.api_key)

        # モデル設定
        self.whisper_model = "whisper-1"
        self.chat_model = "gpt-4o"  # GPT-4o (最新版、コスト効率良い)
        self.tts_model = "tts-1"  # 低レイテンシ版
        self.tts_voice = "alloy"  # 音声タイプ (alloy, echo, fable, onyx, nova, shimmer)

    async def transcribe_audio(
        self,
        audio_file_path: str,
        language: str = "ja",
        prompt: Optional[str] = None
    ) -> TranscriptionResult:
        """
        音声ファイルをテキストに変換（Whisper API）

        Args:
            audio_file_path: 音声ファイルパス（mp3, wav, m4a等）
            language: 言語コード（ja: 日本語）
            prompt: ヒント文（専門用語を正しく認識させるため）

        Returns:
            TranscriptionResult: 認識結果
        """
        with open(audio_file_path, "rb") as audio_file:
            # Whisper APIで音声認識
            transcript = await self.client.audio.transcriptions.create(
                model=self.whisper_model,
                file=audio_file,
                language=language,
                prompt=prompt,  # エアコン用語のヒント
                response_format="verbose_json"  # 詳細情報取得
            )

        return TranscriptionResult(
            text=transcript.text,
            language=transcript.language,
            duration=transcript.duration
        )

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> ChatCompletionResult:
        """
        チャット応答生成（GPT-4 API）

        Args:
            messages: メッセージリスト [{"role": "system|user|assistant", "content": "..."}]
            temperature: ランダム性（0.0〜2.0、低いほど一貫性高い）
            max_tokens: 最大トークン数

        Returns:
            ChatCompletionResult: 応答結果
        """
        response = await self.client.chat.completions.create(
            model=self.chat_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=1.0,
            frequency_penalty=0.0,
            presence_penalty=0.0
        )

        choice = response.choices[0]

        return ChatCompletionResult(
            content=choice.message.content,
            model=response.model,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            },
            finish_reason=choice.finish_reason
        )

    async def synthesize_speech(
        self,
        text: str,
        voice: Optional[str] = None,
        speed: float = 1.0
    ) -> TTSResult:
        """
        テキストを音声に変換（TTS API）

        Args:
            text: 読み上げるテキスト
            voice: 音声タイプ (alloy, echo, fable, onyx, nova, shimmer)
            speed: 速度（0.25〜4.0、1.0が標準）

        Returns:
            TTSResult: 音声データ
        """
        voice = voice or self.tts_voice

        response = await self.client.audio.speech.create(
            model=self.tts_model,
            voice=voice,
            input=text,
            speed=speed,
            response_format="mp3"
        )

        # ストリーミングレスポンスをバイトデータに変換
        audio_data = b""
        async for chunk in response.iter_bytes():
            audio_data += chunk

        return TTSResult(
            audio_data=audio_data,
            format="mp3"
        )

    async def voice_to_voice_chat(
        self,
        audio_file_path: str,
        system_prompt: str,
        chat_history: List[Dict[str, str]] = None,
        temperature: float = 0.7
    ) -> Dict[str, any]:
        """
        音声→テキスト→チャット→音声の一連フロー

        Args:
            audio_file_path: 入力音声ファイルパス
            system_prompt: システムプロンプト
            chat_history: 対話履歴
            temperature: GPTの温度パラメータ

        Returns:
            dict: {
                "transcript": 認識テキスト,
                "response_text": 応答テキスト,
                "response_audio": 応答音声データ,
                "usage": トークン使用量
            }
        """
        chat_history = chat_history or []

        # 1. 音声認識（Whisper）
        # エアコン用語のヒント
        whisper_prompt = "エアコン、室内機、室外機、配管、フレア、真空引き、ドレン、冷媒、R32"

        transcription = await self.transcribe_audio(
            audio_file_path=audio_file_path,
            language="ja",
            prompt=whisper_prompt
        )

        # 2. チャット応答生成（GPT-4）
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(chat_history)
        messages.append({"role": "user", "content": transcription.text})

        chat_result = await self.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=500
        )

        # 3. 音声合成（TTS）
        tts_result = await self.synthesize_speech(
            text=chat_result.content,
            speed=1.0  # 標準速度
        )

        return {
            "transcript": transcription.text,
            "response_text": chat_result.content,
            "response_audio": tts_result.audio_data,
            "usage": chat_result.usage,
            "model": chat_result.model
        }


# シングルトンインスタンス
_openai_service: Optional[OpenAIService] = None


def get_openai_service() -> OpenAIService:
    """OpenAIServiceのシングルトンインスタンスを取得"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service


# 使用例（テスト用）
async def test_openai_service():
    """OpenAIサービスのテスト"""
    service = get_openai_service()

    # 1. テキストチャットのテスト
    print("=== テキストチャットテスト ===")
    messages = [
        {"role": "system", "content": "あなたはエアコン設置の専門家です。"},
        {"role": "user", "content": "室内機の取付高さは？"}
    ]

    result = await service.chat_completion(messages)
    print(f"回答: {result.content}")
    print(f"使用トークン: {result.usage['total_tokens']}")

    # 2. 音声合成のテスト
    print("\n=== 音声合成テスト ===")
    tts_result = await service.synthesize_speech(
        text="室内機は床から2メートルの高さに取り付けてください。"
    )
    print(f"音声データサイズ: {len(tts_result.audio_data)} bytes")

    # 音声ファイルに保存
    with open("/tmp/test_tts.mp3", "wb") as f:
        f.write(tts_result.audio_data)
    print("音声ファイルを /tmp/test_tts.mp3 に保存しました")


if __name__ == "__main__":
    # テスト実行
    asyncio.run(test_openai_service())
