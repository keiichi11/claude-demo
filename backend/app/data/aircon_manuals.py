"""
エアコン設置マニュアルデータベース
大手メーカーの主要機種の詳細な設置手順、仕様、トラブルシューティング情報を含む
"""

AIRCON_MANUALS = {
    # パナソニック Eoliaシリーズ
    "CS-X400D2": {
        "manufacturer": "パナソニック",
        "series": "Eolia Xシリーズ",
        "model": "CS-X400D2",
        "capacity": "14畳用（4.0kW）",
        "type": "壁掛け型ルームエアコン",
        "refrigerant": "R32",

        "indoor_unit": {
            "dimensions": {
                "width": "798mm",
                "height": "295mm",
                "depth": "385mm",
                "weight": "15kg"
            },
            "installation": {
                "ceiling_clearance": "50mm以上",
                "left_wall_clearance": "100mm以上",
                "right_wall_clearance": "100mm以上（配管スペース確保のため）",
                "mounting_height": "床から1.8m〜2.3m（推奨2.0m）",
                "wall_strength": "石膏ボード厚12.5mm以上、下地（間柱）への固定必須",
                "pipe_hole_diameter": "65mm（スリーブ含む）",
                "pipe_hole_position": "室内機中心から右側150mm、下方50mmの位置",
                "pipe_hole_downward_slope": "屋外側に向けて1/100以上の勾配"
            },
            "mounting_plate": {
                "type": "専用据付板（付属）",
                "fixing_screws": "M4×35mm トラスタッピングネジ（木下地用）または アンカー併用（石膏ボード）",
                "screw_count": "最低4箇所、推奨6箇所",
                "levelness": "水平器で確認、傾き±1mm以内"
            }
        },

        "outdoor_unit": {
            "dimensions": {
                "width": "799mm",
                "height": "630mm",
                "depth": "299mm",
                "weight": "42kg"
            },
            "installation": {
                "clearances": {
                    "front": "250mm以上",
                    "back": "100mm以上",
                    "left": "50mm以上",
                    "right": "50mm以上",
                    "top": "300mm以上（直射日光を避ける）"
                },
                "foundation": {
                    "type": "コンクリートブロック（エアコン架台用）またはプラスチック製防振架台",
                    "levelness": "水平±3mm以内",
                    "drainage": "ドレン水排出のため前傾2〜3度の勾配推奨"
                },
                "fixing": "アンカーボルトまたは固定金具で確実に固定（台風・地震対策）",
                "noise_consideration": "寝室の窓、隣家の境界から3m以上離す",
                "elevation_limit": "室内機との高低差5m以内（標準配管時）"
            }
        },

        "piping": {
            "refrigerant_pipe": {
                "size_liquid": "2分（6.35mm）",
                "size_gas": "3分（9.52mm）",
                "material": "銅管（りん脱酸銅）",
                "max_length": "15m（標準5m、追加チャージ不要は10mまで）",
                "max_elevation": "10m",
                "flare_nut_torque": {
                    "2分": "14〜18N·m（1.4〜1.8kgf·m）",
                    "3分": "34〜42N·m（3.5〜4.3kgf·m）"
                },
                "flare_processing": {
                    "cut": "パイプカッターで直角切断（ノコギリ不可）",
                    "deburring": "リーマーでバリ取り（内部に切粉を入れない）",
                    "flare": "フレアツールで規定寸法に加工",
                    "flare_dimensions": {
                        "2分": "高さ0.7〜1.0mm、外径9.1mm",
                        "3分": "高さ0.7〜1.0mm、外径13.2mm"
                    },
                    "inspection": "目視で傷・歪み・偏心がないか確認"
                },
                "insulation": {
                    "material": "ポリエチレンフォーム（厚さ10mm以上）",
                    "taping": "テープ巻き時は1/2重ねで隙間なく巻く"
                }
            },
            "drain_pipe": {
                "size": "内径16mm（VP16）",
                "slope": "1/100以上（100cmで1cm下がる）",
                "material": "塩ビ管または専用ドレンホース",
                "trap": "屋外排出口に防虫キャップ必須",
                "insulation": "結露防止のため保温材巻き推奨（冷房使用時）",
                "discharge": "雨水排水溝または適切な排水場所（隣地に流さない）"
            },
            "electrical_wiring": {
                "power_cable": "VVF 2.0mm×2芯（単相100V）",
                "control_cable": "VVF 1.6mm×3芯（室内機-室外機間）",
                "earth": "D種接地工事（接地抵抗100Ω以下）必須",
                "breaker": "専用ブレーカー20A（漏電ブレーカー推奨）",
                "cable_route": "配管と同じ穴を通す、別配線時は干渉防止"
            }
        },

        "vacuum_pump": {
            "equipment": "真空ポンプ（到達真空度-101kPa以上）",
            "procedure": {
                "1": "フレアナットを規定トルクで締め付け",
                "2": "室外機の3方弁（液側・ガス側）を閉じる",
                "3": "チャージバルブに真空ポンプ接続",
                "4": "真空ポンプ起動、-0.1MPa（-101kPa）まで引く",
                "5": "真空到達後、さらに15分以上真空引き継続",
                "6": "真空ポンプ停止後、5分間放置（真空保持確認）",
                "7": "真空ゲージが-0.1MPaを保持していればOK",
                "8": "3方弁を全開（六角レンチで反時計回りに回す）",
                "9": "冷媒ガスが配管内に充填されたことを確認"
            },
            "target_vacuum": "-0.1MPa（-101kPa）以下",
            "hold_time": "15分以上",
            "leak_test": "5分間放置して圧力上昇がないこと（0.3kPa以内）"
        },

        "test_run": {
            "preparation": {
                "power_on": "ブレーカーON後、6時間以上待機（コンプレッサー暖機）",
                "remote_battery": "リモコンに電池挿入、動作確認"
            },
            "cooling_test": {
                "mode": "冷房運転",
                "temperature": "設定温度16℃（最低温度）",
                "fan_speed": "強風",
                "duration": "10分間運転",
                "check_吹出温度": "室温より10〜15℃低い冷風が出ること",
                "check_室外機": "ファン回転、コンプレッサー動作音確認",
                "check_配管温度": "ガス管が冷たくなり、結露していること",
                "check_ドレン": "ドレン水が排出されること（5分後〜）"
            },
            "heating_test": {
                "mode": "暖房運転",
                "temperature": "設定温度30℃（最高温度）",
                "fan_speed": "強風",
                "duration": "10分間運転",
                "check_吹出温度": "室温より15〜20℃高い温風が出ること",
                "check_室外機": "霜取り運転が発生する場合あり（正常）",
                "check_配管温度": "液管が温かくなること"
            },
            "abnormality_check": {
                "異音": "異常な振動音、ガラガラ音がないこと",
                "異臭": "焦げ臭い、プラスチック臭がないこと",
                "エラーコード": "リモコンにエラー表示がないこと",
                "漏水": "室内機から水漏れがないこと"
            }
        },

        "safety_warnings": {
            "electrical": [
                "電気工事は第二種電気工事士以上の有資格者が実施",
                "作業前に必ずブレーカーOFF、電圧テスターで確認",
                "接地工事を必ず実施（感電防止）",
                "漏電ブレーカーの動作確認"
            ],
            "height": [
                "室内機取付時は脚立の安全確認（四脚接地、ロック確認）",
                "高所作業時は安全帯着用（2m以上の作業）",
                "室外機屋根置き時はフルハーネス型安全帯必須"
            ],
            "refrigerant": [
                "R32冷媒は微燃性（火気厳禁）",
                "冷媒漏洩時は換気を十分に行う",
                "フレア接続部は確実に締め付け（ガス漏れ防止）",
                "真空ポンプオイルは定期交換"
            ],
            "weight": [
                "室外機（42kg）は2名以上で運搬",
                "腰を落として持ち上げる（腰痛予防）",
                "階段運搬時は特に注意"
            ]
        },

        "troubleshooting": {
            "真空引きで真空度が上がらない": {
                "原因": [
                    "フレアナットの締め付け不足（ガス漏れ）",
                    "フレア加工不良（傷、偏心、バリ残り）",
                    "3方弁が開いている（閉め忘れ）",
                    "真空ポンプのオイル劣化",
                    "ホースの接続不良"
                ],
                "対処": [
                    "フレアナットを規定トルクで増し締め",
                    "石鹸水でガス漏れ箇所特定、フレア再加工",
                    "3方弁の閉状態を再確認",
                    "真空ポンプのオイル交換",
                    "ホース接続部の増し締め、Oリング確認"
                ]
            },
            "試運転で冷風が出ない": {
                "原因": [
                    "3方弁の開け忘れ（冷媒が循環していない）",
                    "電源の相違（200V機種に100V接続等）",
                    "リモコン設定ミス（暖房モードになっている）",
                    "冷媒不足（配管長過ぎ、ガス漏れ）"
                ],
                "対処": [
                    "3方弁（液側・ガス側）を全開に",
                    "電源電圧を確認（銘板と一致）",
                    "リモコンで冷房モード、16℃設定に",
                    "配管長確認、追加チャージ実施"
                ]
            },
            "ドレン水が排出されない": {
                "原因": [
                    "ドレンホースの勾配不足（逆勾配）",
                    "ドレンホースの詰まり（ゴミ、虫）",
                    "ドレンホースの潰れ",
                    "室内機の傾き（ドレンパン側が上がっている）"
                ],
                "対処": [
                    "ドレンホースを1/100以上の勾配に修正",
                    "ドレンホース内を水で洗浄、掃除機で吸引",
                    "潰れ箇所を交換または修正",
                    "室内機を水平に再調整（据付板の調整）"
                ]
            },
            "室内機から水漏れ": {
                "原因": [
                    "ドレンホースの詰まり・逆勾配",
                    "配管穴の断熱不足（結露水が壁内を伝う）",
                    "フレアナット接続部からのガス漏れ（冷媒循環不良）",
                    "室内機の傾き"
                ],
                "対処": [
                    "ドレン排水の確認・清掃",
                    "配管穴周囲をパテで埋める、保温強化",
                    "石鹸水でガス漏れ点検、フレア締め直し",
                    "据付板を水平に調整"
                ]
            },
            "異音が発生": {
                "原因": [
                    "据付板の固定不足（振動音）",
                    "配管の共振（壁・床との接触）",
                    "室外機の設置不良（がたつき）",
                    "ファンへの異物混入"
                ],
                "対処": [
                    "据付板のネジを増し締め、必要に応じて追加",
                    "配管と壁の間に緩衝材挿入",
                    "室外機を水平に再設置、防振ゴム使用",
                    "ファン目視点検、異物除去"
                ]
            }
        },

        "special_notes": {
            "塩害地域": "海岸から300m以内は耐塩害仕様機種を選定、通常機種は故障リスク大",
            "寒冷地": "暖房能力は外気温-15℃まで保証、それ以下は補助暖房併用",
            "長配管": "15m超える場合は冷媒追加チャージ必要（1mあたり20g）",
            "天井埋込": "点検口必須、フィルター清掃・メンテナンス考慮",
            "マルチエアコン": "室内機3台以上は専門業者に依頼推奨"
        }
    },

    # ダイキン うるさらXシリーズ
    "AN40ZRP": {
        "manufacturer": "ダイキン",
        "series": "うるさらX（Rシリーズ）",
        "model": "AN40ZRP",
        "capacity": "14畳用（4.0kW）",
        "type": "壁掛け型ルームエアコン",
        "refrigerant": "R32",

        "indoor_unit": {
            "dimensions": {
                "width": "798mm",
                "height": "295mm",
                "depth": "370mm",
                "weight": "17kg"
            },
            "installation": {
                "ceiling_clearance": "100mm以上",
                "left_wall_clearance": "50mm以上",
                "right_wall_clearance": "50mm以上",
                "mounting_height": "床から1.8m〜2.5m（推奨2.2m）",
                "pipe_hole_diameter": "70mm（加湿用給水管も通すため）",
                "pipe_hole_position": "室内機左側または右側（選択可能）",
                "wall_strength": "石膏ボード+間柱固定、アンカー併用"
            }
        },

        "outdoor_unit": {
            "dimensions": {
                "width": "795mm",
                "height": "690mm",
                "depth": "300mm",
                "weight": "48kg"
            },
            "installation": {
                "clearances": {
                    "front": "300mm以上",
                    "back": "100mm以上",
                    "left": "100mm以上",
                    "right": "100mm以上",
                    "top": "500mm以上"
                },
                "special_note": "うるさらX機能（加湿・換気）使用のため、換気口確保必須"
            }
        },

        "piping": {
            "refrigerant_pipe": {
                "size_liquid": "2分（6.35mm）",
                "size_gas": "3分（9.52mm）",
                "max_length": "20m",
                "flare_nut_torque": {
                    "2分": "15〜17N·m",
                    "3分": "35〜40N·m"
                }
            },
            "drain_pipe": {
                "size": "内径20mm（VP20）",
                "special": "加湿機能使用時はドレン量増加、排水能力重要",
                "slope": "1/50以上推奨"
            },
            "water_supply_pipe": {
                "type": "加湿用給水配管（オプション）",
                "size": "内径8mm",
                "connection": "水道直結または給水タンク方式"
            }
        },

        "vacuum_pump": {
            "target_vacuum": "-0.1MPa以下",
            "hold_time": "10分以上",
            "special_note": "ダイキン機種は真空引き後にガス漏れチェック必須"
        },

        "test_run": {
            "cooling_test": {
                "mode": "冷房運転",
                "temperature": "18℃",
                "duration": "15分間",
                "check_加湿機能": "加湿ランプ点灯確認（給水接続時）"
            },
            "heating_test": {
                "mode": "暖房運転",
                "temperature": "28℃",
                "duration": "15分間"
            }
        },

        "safety_warnings": {
            "electrical": [
                "電気工事士資格必須",
                "接地工事実施",
                "専用ブレーカー20A設置"
            ],
            "refrigerant": [
                "R32は微燃性、火気厳禁",
                "密閉空間での作業時は換気必須"
            ]
        },

        "troubleshooting": {
            "加湿機能が動作しない": {
                "原因": [
                    "給水配管の接続不良",
                    "給水タンクの水切れ",
                    "加湿設定がOFF"
                ],
                "対処": [
                    "給水配管の接続確認",
                    "給水タンクに水補充",
                    "リモコンで加湿ON設定"
                ]
            }
        }
    },

    # 三菱電機 霧ヶ峰Zシリーズ
    "MSZ-ZW4022S": {
        "manufacturer": "三菱電機",
        "series": "霧ヶ峰 Zシリーズ",
        "model": "MSZ-ZW4022S",
        "capacity": "14畳用（4.0kW）",
        "type": "壁掛け型ルームエアコン",
        "refrigerant": "R32",

        "indoor_unit": {
            "dimensions": {
                "width": "799mm",
                "height": "295mm",
                "depth": "389mm",
                "weight": "16kg"
            },
            "installation": {
                "ceiling_clearance": "50mm以上",
                "left_wall_clearance": "50mm以上",
                "right_wall_clearance": "50mm以上",
                "mounting_height": "床から1.8m〜2.3m",
                "pipe_hole_diameter": "65mm"
            }
        },

        "outdoor_unit": {
            "dimensions": {
                "width": "800mm",
                "height": "714mm",
                "depth": "285mm",
                "weight": "45kg"
            }
        },

        "piping": {
            "refrigerant_pipe": {
                "size_liquid": "2分（6.35mm）",
                "size_gas": "3分（9.52mm）",
                "max_length": "15m",
                "flare_nut_torque": {
                    "2分": "14〜18N·m",
                    "3分": "34〜42N·m"
                }
            }
        },

        "vacuum_pump": {
            "target_vacuum": "-0.1MPa以下",
            "hold_time": "15分以上"
        },

        "test_run": {
            "special_feature": "ムーブアイ（人感センサー）の動作確認必須"
        }
    }
}


# トラブルシューティング共通知識
COMMON_TROUBLESHOOTING = {
    "エラーコード一覧": {
        "E0": "室内外通信異常 - 配線接続確認",
        "E3": "高圧圧力異常 - 室外機の通風確認",
        "E5": "室外機基板異常 - メーカーサービス連絡",
        "E6": "冷媒漏れ検知 - 配管接続部点検",
        "E7": "ファンモーター異常 - ファン回転確認",
        "F3": "ドレン水位異常 - ドレンホース詰まり確認",
        "P1": "電源電圧異常 - 電源電圧測定",
        "U2": "低電圧検出 - 電源配線確認",
        "U4": "室内外伝送異常 - 配線接続再確認"
    }
}


# 安全規定
SAFETY_REGULATIONS = {
    "電気工事士法": {
        "資格": "第二種電気工事士以上",
        "作業範囲": "エアコン専用回路の新設、コンセント増設、ブレーカー設置",
        "罰則": "無資格工事は3万円以下の罰金または3ヶ月以下の懲役"
    },
    "フロン排出抑制法": {
        "対象": "業務用エアコン（家庭用は対象外だが適正管理推奨）",
        "冷媒回収": "廃棄時は冷媒回収が義務",
        "漏洩点検": "圧力計による定期点検"
    },
    "労働安全衛生法": {
        "高所作業": "2m以上の作業は安全帯着用義務",
        "足場": "作業床の設置、手すり設置",
        "保護具": "ヘルメット、安全靴、絶縁手袋"
    }
}


# 工具リスト
REQUIRED_TOOLS = {
    "電動工具": [
        "電動ドリル（穴あけ用）",
        "コアドリル（65mm、70mm）",
        "インパクトドライバー（ネジ締め用）"
    ],
    "配管工具": [
        "パイプカッター（2分・3分用）",
        "リーマー（バリ取り）",
        "フレアツール（R410A対応）",
        "トルクレンチ（5〜60N·m）",
        "パイプベンダー（曲げ加工用）"
    ],
    "真空引き工具": [
        "真空ポンプ（到達真空度-101kPa以上）",
        "真空ゲージ（-0.1MPa表示可能）",
        "チャージングホース"
    ],
    "測定器": [
        "水平器（据付板・室外機設置用）",
        "電圧テスター（AC100V/200V測定）",
        "絶縁抵抗計（接地抵抗測定）",
        "温度計（吹出温度確認用）"
    ],
    "その他": [
        "六角レンチセット（3方弁開閉用）",
        "モンキーレンチ",
        "ペンチ・ニッパー",
        "カッターナイフ",
        "メジャー（5m以上）",
        "マスキングテープ",
        "養生シート"
    ]
}


def get_manual(model: str) -> dict:
    """機種名からマニュアル情報を取得"""
    return AIRCON_MANUALS.get(model, {})


def search_troubleshooting(symptom: str) -> list:
    """症状からトラブルシューティング情報を検索"""
    results = []
    for model, manual in AIRCON_MANUALS.items():
        if "troubleshooting" in manual:
            for issue, details in manual["troubleshooting"].items():
                if symptom in issue:
                    results.append({
                        "model": model,
                        "issue": issue,
                        "details": details
                    })
    return results
