"""
API動作確認スクリプト
OpenAI APIキーを設定してから実行してください
"""

import asyncio
import os
from pathlib import Path

# 環境変数設定（テスト用）
# 実際のAPIキーは .env ファイルに設定してください
# os.environ["OPENAI_API_KEY"] = "sk-your-key-here"

from app.services.openai_service import get_openai_service
from app.core.prompts import build_system_prompt
from app.data.aircon_manuals import get_manual


async def test_text_chat():
    """テキストチャットのテスト"""
    print("=" * 60)
    print("テキストチャットテスト")
    print("=" * 60)

    # OpenAIサービス取得
    service = get_openai_service()

    # マニュアルデータ取得
    model = "CS-X400D2"
    manual_data = get_manual(model)

    # システムプロンプト構築
    system_prompt = build_system_prompt(
        model=model,
        current_step="室内機設置",
        manual_data=manual_data
    )

    # テスト質問
    questions = [
        "この機種の室内機の取付位置を教えてください",
        "フレアナットの締付トルクは？",
        "真空引きで真空度が上がらないのですが"
    ]

    for question in questions:
        print(f"\n質問: {question}")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]

        result = await service.chat_completion(messages)

        print(f"回答: {result.content}")
        print(f"トークン使用: {result.usage['total_tokens']}")
        print("-" * 60)


async def test_voice_synthesis():
    """音声合成のテスト"""
    print("\n" + "=" * 60)
    print("音声合成テスト")
    print("=" * 60)

    service = get_openai_service()

    text = "室内機は天井から50ミリメートル以上、左右の壁から100ミリメートル以上離してください。"

    print(f"テキスト: {text}")
    print("音声合成中...")

    result = await service.synthesize_speech(text)

    # 音声ファイルに保存
    output_path = "/tmp/test_tts_output.mp3"
    with open(output_path, "wb") as f:
        f.write(result.audio_data)

    print(f"✓ 音声ファイルを保存しました: {output_path}")
    print(f"  ファイルサイズ: {len(result.audio_data)} bytes")


async def test_available_models():
    """利用可能な機種一覧のテスト"""
    print("\n" + "=" * 60)
    print("利用可能な機種一覧")
    print("=" * 60)

    from app.data.aircon_manuals import AIRCON_MANUALS

    for model_name, manual in AIRCON_MANUALS.items():
        print(f"\n機種: {model_name}")
        print(f"  メーカー: {manual.get('manufacturer')}")
        print(f"  シリーズ: {manual.get('series')}")
        print(f"  能力: {manual.get('capacity')}")
        print(f"  冷媒: {manual.get('refrigerant')}")


async def main():
    """メインテスト"""
    print("\n🤖 エアコン設置作業支援Chatbot AI - 動作確認\n")

    # APIキー確認
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY が設定されていません")
        print("   .env ファイルを作成して設定してください")
        print("\n   例: OPENAI_API_KEY=sk-your-key-here\n")
        return

    print("✓ OPENAI_API_KEY が設定されています\n")

    try:
        # 利用可能な機種一覧
        await test_available_models()

        # テキストチャット
        await test_text_chat()

        # 音声合成
        await test_voice_synthesis()

        print("\n" + "=" * 60)
        print("✓ 全てのテストが完了しました")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    # dotenvから環境変数を読み込む
    from dotenv import load_dotenv
    load_dotenv()

    # テスト実行
    asyncio.run(main())
