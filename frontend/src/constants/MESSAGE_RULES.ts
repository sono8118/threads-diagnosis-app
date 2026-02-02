// ============================================================================
// カスタムメッセージエンジン - ルール定義
// ============================================================================

import type { MessageRules } from '../types';

/**
 * カスタムメッセージエンジンのルール定義
 *
 * JSON駆動ルールエンジン:
 * - 主メッセージ: タイプ別（T1-T4）の固定メッセージ（必ず1つ表示）
 * - 個別ルール: 条件に基づいて評価され、優先度順に最大2つまで表示
 *
 * ルール評価順序:
 * 1. enabled: true のルールのみを対象
 * 2. conditions で条件評価
 * 3. priority で降順ソート（大きい順）
 * 4. 上位2件のみを取得
 *
 * 優先度分類:
 * - 90-100: 致命傷系（ビジネスモデルの根本的破綻）
 * - 85: 時間系（直近の行動改善で即効性あり）
 * - 75-80: 改善停止系（PDCA回さない体質）
 * - 65-70: 導線なし系（マネタイズ構造の欠落）
 */
export const MESSAGE_RULES: MessageRules = {
  version: '1.0.0',

  /**
   * 主メッセージ（タイプ別、必ず1つ表示）
   * 🆕 MIXタイプ追加（2026-01-30）
   */
  mainMessages: {
    BEGINNER:
      'あなたは今"はじまりの状態"。これからどんな形にもなれる自由な場所にいるということです。これから少しずつ形にしていきましょう。',
    BALANCED:
      '素晴らしい！Threadsを効果的に活用できています。この調子で継続的な改善を続けましょう。',
    T1: '誰に何を届けるかが定まっていない状態です。まずはターゲット設定から始めましょう。',
    T2: 'やる気はあるのに続ける仕組みがない状態です。仕組みと習慣で楽になりましょう。',
    T3: '頑張っているのに成果に変わらない状態です。改善ループを回して成果を出しましょう。',
    T4: '今は、頑張ればできるのに、「頑張らないと続かない形」になっています。仕組みを整えれば、迷わず・疲れず・自然に回る運用に変わります。',
    // 🆕 MIXタイプのメッセージ
    'T1T2-MIX': '設計力と量産力が同時に弱い状態です。まずはターゲット設定と型作りから始めましょう。',
    'T1T3-MIX': '設計力と改善力が同時に弱い状態です。ターゲット設定と改善ループの確立が必要です。',
    'T1T4-MIX': '設計力と継続力が同時に弱い状態です。方向性の設定と続ける仕組み作りから始めましょう。',
    'T2T3-MIX': '量産力と改善力が同時に弱い状態です。型作りと改善ループの両方を整えましょう。',
    'T2T4-MIX': '量産力と継続力が同時に弱い状態です。続けられる仕組みと型の両方が必要です。',
    'T3T4-MIX': '改善力と継続力が同時に弱い状態です。成果の確認と継続の仕組み、両方を整えましょう。',
  },

  /**
   * 個別ルール（優先度順に評価、最大2つまで表示）
   */
  rules: [
    // ========================================
    // ① 0点が含まれるもの（致命傷系、priority 90-100）
    // ========================================

    {
      id: 'q6-zero',
      priority: 100,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q6',
        axisKey: 'production',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q6',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '型とストックがないため、投稿作成に時間がかかり消耗しています。',
      enabled: true,
    },

    {
      id: 'q7-zero',
      priority: 95,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q7',
        axisKey: 'improvement',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q7',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '改善ループが存在していない状態です。頑張りが積み上がらない構造になっています。',
      enabled: true,
    },

    {
      id: 'q10-zero',
      priority: 95,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q10',
        axisKey: 'continuation',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q10',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '投稿の流れが決まっていないため、毎回迷いが発生し、継続が不安定になります。',
      enabled: true,
    },

    // ========================================
    // ② 時間系（行動コスト直撃、priority 85）
    // ========================================

    {
      id: 'q6-high',
      priority: 85,
      severity: 'normal', // 🆕 標準的な指摘
      meta: {
        questionKey: 'Q6',
        axisKey: 'production',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q6',
            operator: 'equals',
            value: 3,
          },
        ],
      },
      message: '投稿作成に時間がかかっている状態です。テンプレート化で時間を半減できます。',
      enabled: true,
    },

    // ========================================
    // ③ 改善停止系（数字見ない・仮説なし、priority 75-80）
    // ========================================

    {
      id: 'q8-zero',
      priority: 80,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q8',
        axisKey: 'improvement',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q8',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '伸びる理由がわからないため、再現性がなく運頼みの状態です。',
      enabled: true,
    },

    {
      id: 'q9-zero',
      priority: 75,
      severity: 'normal', // 🆕 標準的な指摘
      meta: {
        questionKey: 'Q9',
        axisKey: 'improvement',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q9',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '成功を再現できていないため、成果が安定しません。',
      enabled: true,
    },

    // ========================================
    // ④ 導線なし系（出口がない、priority 65-70）
    // ========================================

    {
      id: 'q11-zero',
      priority: 100,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q11',
        axisKey: 'continuation',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q11',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '投稿の流れを支える仕組みがないため、毎回ゼロから考える運用になっています。まずは「同じ流れで回す形」を作りましょう。',
      enabled: true,
    },

    {
      id: 'q12-zero',
      priority: 90,
      severity: 'hard', // 🆕 致命的な指摘
      meta: {
        questionKey: 'Q12',
        axisKey: 'continuation',
      },
      conditions: {
        logic: 'AND',
        conditions: [
          {
            field: 'Q12',
            operator: 'equals',
            value: 0,
          },
        ],
      },
      message: '運用が「頑張り」になっており、長く続けるのが難しい状態です。',
      enabled: true,
    },

  ],
};
