"""
プロンプトエンジニアリング
エアコン設置作業支援AIのためのシステムプロンプトとプロンプト構築ロジック
"""

import json
from typing import List, Dict, Any


def build_system_prompt(model: str = None, current_step: str = None, manual_data: dict = None) -> str:
    """
    システムプロンプトを構築

    Args:
        model: エアコン機種名（例: CS-X400D2）
        current_step: 現在の作業工程
        manual_data: マニュアルデータ（app/data/aircon_manuals.pyから取得）

    Returns:
        システムプロンプト文字列
    """

    base_prompt = """あなたはエアコン設置工事の現場作業者を支援する専門AIアシスタントです。

【役割】
- 作業手順、設置仕様、安全基準、トラブルシューティングに関する質問に明確かつ簡潔に答える
- 現場作業者が音声で質問することを想定し、聞き取りやすく、要点を絞った回答を提供する
- 安全に関する情報は特に慎重に扱い、必ず警告を含める
- 具体的な数値（距離、トルク、時間等）を正確に伝える

【制約】
- 提供されたマニュアル情報に基づいて回答する（推測しない）
- 不明な場合や確信が持てない場合は「マニュアルを確認してください」と答える
- 安全に関わる重要な情報（高所作業、電気工事、冷媒取扱い）には必ず⚠️マークと警告を含める
- 複雑な手順は箇条書きで段階的に説明する

【回答スタイル】
- 簡潔に（理想は3文以内、複雑な場合でも5文以内）
- 専門用語は必要最小限に、わかりやすく
- 数値は具体的に（例: 「天井から50mm以上」「トルク14〜18N·m」）
- 手順は番号付きリストで（例: 1. ○○を確認 2. ××を実施）
- 音声で聞いてもわかりやすい表現（「えぬめーとる」ではなく「ニュートンメートル」）

【安全最優先】
以下の場合は必ず警告を出す:
- 高所作業（2m以上）→ 安全帯着用必須
- 電気工事 → ブレーカーOFF確認、有資格者作業
- 冷媒取扱い → R32は微燃性、火気厳禁
- 重量物運搬 → 2名以上で作業、腰痛注意
"""

    # 機種情報がある場合は追加
    if model and manual_data:
        manufacturer = manual_data.get("manufacturer", "不明")
        series = manual_data.get("series", "")
        capacity = manual_data.get("capacity", "")
        refrigerant = manual_data.get("refrigerant", "")

        model_info = f"""
【現在の作業機種】
- メーカー: {manufacturer}
- シリーズ: {series}
- 機種: {model}
- 能力: {capacity}
- 冷媒: {refrigerant}
"""
        base_prompt += model_info

    # 作業工程がある場合は追加
    if current_step:
        step_info = f"""
【現在の作業工程】
{current_step}
"""
        base_prompt += step_info

    # マニュアルデータがある場合は詳細を追加
    if manual_data:
        manual_details = format_manual_for_prompt(manual_data)
        base_prompt += f"""
【機種別マニュアル情報】
{manual_details}
"""

    base_prompt += """
【回答例】
質問: 「この機種の室内機の取付位置は？」
回答: 「CS-X400D2の室内機は、天井から50mm以上、左の壁から100mm以上、右の壁から100mm以上離してください。右側には配管スペースが必要です。床からの高さは2.0m推奨です。」

質問: 「真空引きで真空度が上がらない」
回答: 「真空度が上がらない主な原因は3つです。1. フレアナットの締め付け不足、2. フレア加工不良、3. 3方弁の閉め忘れ。まずフレアナットを規定トルクで増し締めしてください。2分は14〜18ニュートンメートル、3分は34〜42ニュートンメートルです。」

質問: 「室外機を屋根に設置する」
回答: 「⚠️ 警告: 屋根への室外機設置は高所作業になります。必ずフルハーネス型安全帯を着用してください。また、屋根の荷重強度を確認し、必要に応じて補強が必要です。作業は2名以上で行ってください。」

それでは、作業者からの質問に答えてください。
"""

    return base_prompt


def format_manual_for_prompt(manual_data: dict) -> str:
    """
    マニュアルデータをプロンプト用に整形

    Args:
        manual_data: マニュアル辞書

    Returns:
        整形されたマニュアルテキスト
    """
    sections = []

    # 室内機仕様
    if "indoor_unit" in manual_data:
        indoor = manual_data["indoor_unit"]
        text = "■ 室内機仕様\n"

        if "dimensions" in indoor:
            dims = indoor["dimensions"]
            text += f"寸法: 幅{dims.get('width')} × 高さ{dims.get('height')} × 奥行{dims.get('depth')}\n"
            text += f"重量: {dims.get('weight')}\n"

        if "installation" in indoor:
            inst = indoor["installation"]
            text += "\n設置基準:\n"
            for key, value in inst.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        if "mounting_plate" in indoor:
            plate = indoor["mounting_plate"]
            text += "\n据付板:\n"
            for key, value in plate.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        sections.append(text)

    # 室外機仕様
    if "outdoor_unit" in manual_data:
        outdoor = manual_data["outdoor_unit"]
        text = "■ 室外機仕様\n"

        if "dimensions" in outdoor:
            dims = outdoor["dimensions"]
            text += f"寸法: 幅{dims.get('width')} × 高さ{dims.get('height')} × 奥行{dims.get('depth')}\n"
            text += f"重量: {dims.get('weight')}\n"

        if "installation" in outdoor:
            inst = outdoor["installation"]
            if "clearances" in inst:
                text += "\n離隔距離:\n"
                for direction, distance in inst["clearances"].items():
                    text += f"- {direction}: {distance}\n"

            if "foundation" in inst:
                found = inst["foundation"]
                text += "\n基礎:\n"
                for key, value in found.items():
                    if isinstance(value, str):
                        text += f"- {key}: {value}\n"

        sections.append(text)

    # 配管仕様
    if "piping" in manual_data:
        piping = manual_data["piping"]
        text = "■ 配管仕様\n"

        if "refrigerant_pipe" in piping:
            ref = piping["refrigerant_pipe"]
            text += "冷媒配管:\n"
            text += f"- 液管サイズ: {ref.get('size_liquid')}\n"
            text += f"- ガス管サイズ: {ref.get('size_gas')}\n"
            text += f"- 最大配管長: {ref.get('max_length')}\n"

            if "flare_nut_torque" in ref:
                text += "- フレアナット締付トルク:\n"
                for size, torque in ref["flare_nut_torque"].items():
                    text += f"  - {size}: {torque}\n"

            if "flare_processing" in ref:
                text += "\nフレア加工手順:\n"
                flare = ref["flare_processing"]
                for key, value in flare.items():
                    if isinstance(value, str):
                        text += f"- {key}: {value}\n"
                    elif key == "flare_dimensions" and isinstance(value, dict):
                        text += "- フレア寸法:\n"
                        for size, dim in value.items():
                            text += f"  - {size}: {dim}\n"

        if "drain_pipe" in piping:
            drain = piping["drain_pipe"]
            text += "\nドレン配管:\n"
            for key, value in drain.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        if "electrical_wiring" in piping:
            elec = piping["electrical_wiring"]
            text += "\n電気配線:\n"
            for key, value in elec.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        sections.append(text)

    # 真空引き手順
    if "vacuum_pump" in manual_data:
        vacuum = manual_data["vacuum_pump"]
        text = "■ 真空引き手順\n"
        text += f"目標真空度: {vacuum.get('target_vacuum')}\n"
        text += f"保持時間: {vacuum.get('hold_time')}\n"

        if "procedure" in vacuum:
            text += "\n手順:\n"
            for step_num, step_desc in sorted(vacuum["procedure"].items()):
                text += f"{step_num}. {step_desc}\n"

        sections.append(text)

    # 試運転手順
    if "test_run" in manual_data:
        test = manual_data["test_run"]
        text = "■ 試運転手順\n"

        if "preparation" in test:
            text += "準備:\n"
            for key, value in test["preparation"].items():
                text += f"- {key}: {value}\n"

        if "cooling_test" in test:
            cool = test["cooling_test"]
            text += "\n冷房試運転:\n"
            for key, value in cool.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        if "heating_test" in test:
            heat = test["heating_test"]
            text += "\n暖房試運転:\n"
            for key, value in heat.items():
                if isinstance(value, str):
                    text += f"- {key}: {value}\n"

        sections.append(text)

    # 安全警告
    if "safety_warnings" in manual_data:
        warnings = manual_data["safety_warnings"]
        text = "■ ⚠️ 安全警告\n"

        for category, items in warnings.items():
            text += f"\n【{category}】\n"
            for item in items:
                text += f"- {item}\n"

        sections.append(text)

    # トラブルシューティング
    if "troubleshooting" in manual_data:
        troubleshooting = manual_data["troubleshooting"]
        text = "■ トラブルシューティング\n"

        for symptom, details in troubleshooting.items():
            text += f"\n【{symptom}】\n"

            if "原因" in details:
                text += "原因:\n"
                for cause in details["原因"]:
                    text += f"- {cause}\n"

            if "対処" in details:
                text += "対処:\n"
                for action in details["対処"]:
                    text += f"- {action}\n"

        sections.append(text)

    # 特記事項
    if "special_notes" in manual_data:
        notes = manual_data["special_notes"]
        text = "■ 特記事項\n"
        for key, value in notes.items():
            text += f"- {key}: {value}\n"
        sections.append(text)

    return "\n\n".join(sections)


def build_chat_prompt(
    system_prompt: str,
    chat_history: List[Dict[str, str]],
    user_message: str
) -> List[Dict[str, str]]:
    """
    OpenAI Chat Completion用のメッセージリストを構築

    Args:
        system_prompt: システムプロンプト
        chat_history: 対話履歴 [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        user_message: ユーザーの新しいメッセージ

    Returns:
        OpenAI APIに渡すメッセージリスト
    """
    messages = [
        {"role": "system", "content": system_prompt}
    ]

    # 対話履歴を追加（最新10件まで）
    if chat_history:
        messages.extend(chat_history[-10:])

    # 新しいユーザーメッセージを追加
    messages.append({"role": "user", "content": user_message})

    return messages


def extract_safety_keywords(text: str) -> List[str]:
    """
    安全に関するキーワードを抽出

    Args:
        text: ユーザーの質問文

    Returns:
        検出されたキーワードリスト
    """
    safety_keywords = {
        "高所": ["屋根", "はしご", "脚立", "高所", "2階", "ベランダ"],
        "電気": ["電気", "配線", "ブレーカー", "感電", "電源", "コンセント"],
        "冷媒": ["冷媒", "ガス", "R32", "フロン", "真空引き"],
        "重量物": ["室外機", "持ち上げ", "運搬", "重い"]
    }

    detected = []
    text_lower = text.lower()

    for category, keywords in safety_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                detected.append(category)
                break

    return detected


def add_safety_reminder(response: str, safety_keywords: List[str]) -> str:
    """
    安全リマインダーを追加

    Args:
        response: AIの回答
        safety_keywords: 検出された安全キーワード

    Returns:
        安全リマインダーを追加した回答
    """
    reminders = {
        "高所": "\n\n⚠️ 安全リマインダー: 高所作業時は必ず安全帯を着用してください。",
        "電気": "\n\n⚠️ 安全リマインダー: 電気工事前に必ずブレーカーをOFFにして電圧確認してください。",
        "冷媒": "\n\n⚠️ 安全リマインダー: R32冷媒は微燃性です。火気厳禁で作業してください。",
        "重量物": "\n\n⚠️ 安全リマインダー: 室外機は2名以上で運搬し、腰を落として持ち上げてください。"
    }

    for keyword in safety_keywords:
        if keyword in reminders and reminders[keyword] not in response:
            response += reminders[keyword]

    return response
