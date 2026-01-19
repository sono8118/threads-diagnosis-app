// ============================================================================
// 診断質問 - 12問の定義
// ============================================================================

import type { Question, QuestionOption } from '../types';

/**
 * 共通の選択肢（4択）
 */
const COMMON_OPTIONS: QuestionOption[] = [
  { label: 'はい、できます', value: 8 },
  { label: 'だいたいできます', value: 6 },
  { label: 'あまりできません', value: 3 },
  { label: 'できません', value: 0 },
];

/**
 * 12問の質問定義
 */
export const QUESTIONS: Question[] = [
  // 【設計力】
  {
    id: 1,
    question: 'あなたは発信を「どんな人」に届けたいか、はっきり説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'design',
  },
  {
    id: 2,
    question: 'あなたの投稿で、フォロワーは「どんな変化や気づき」を得られるかを3つ説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'design',
  },
  {
    id: 3,
    question: '他の発信者との違い（あなたらしさ）を、一言で説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'design',
  },

  // 【量産力】
  {
    id: 4,
    question: '今すぐ投稿しようと思ったとき、迷わずネタを出せますか？',
    options: COMMON_OPTIONS,
    axis: 'production',
  },
  {
    id: 5,
    question: '投稿を作るときに、毎回使っている型（テンプレート）がありますか？',
    options: COMMON_OPTIONS,
    axis: 'production',
  },
  {
    id: 6,
    question: '1つの投稿を、負担を感じず短時間で作れていますか？',
    options: COMMON_OPTIONS,
    axis: 'production',
  },

  // 【改善力】
  {
    id: 7,
    question: '投稿後の数値を見て、「良かった理由・悪かった理由」を考えていますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },
  {
    id: 8,
    question: '数値をもとに、次の投稿内容を変えたことがありますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },
  {
    id: 9,
    question: '伸びた投稿の要素を意識して、再現を試みていますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },

  // 【継続力】
  {
    id: 10,
    question: '投稿作成や投稿作業を「決まった流れ」で行えていますか？',
    options: COMMON_OPTIONS,
    axis: 'continuation',
  },
  {
    id: 11,
    question: '忙しい日でも迷わず動ける投稿の仕組み（手順・環境）がありますか？',
    options: COMMON_OPTIONS,
    axis: 'continuation',
  },
  {
    id: 12,
    question: 'Threadsの投稿を「がんばらなきゃ」ではなく「自然な習慣」として続けられていますか？',
    options: COMMON_OPTIONS,
    axis: 'continuation',
  },
];
