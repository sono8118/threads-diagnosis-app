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
    question: 'あなたは発信を「どんな人」に届けたいか説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'design',
  },
  {
    id: 2,
    question: 'あなたの投稿で、フォロワーは何を得られるかを3つ説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'design',
  },
  {
    id: 3,
    question: '他の発信者との違いを、一言で説明できますか？',
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
    question: '投稿を作るとき、使っている型（テンプレート）はありますか？',
    options: COMMON_OPTIONS,
    axis: 'production',
  },
  {
    id: 6,
    question: '1つの投稿を、負担なく短時間で作れていますか？',
    options: COMMON_OPTIONS,
    axis: 'production',
  },

  // 【改善力】
  {
    id: 7,
    question: '投稿後、数値を習慣的に確認していますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },
  {
    id: 8,
    question: '数値を見て、なぜ伸びたか／伸びなかったかを説明できますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },
  {
    id: 9,
    question: '伸びた投稿を意図的に再現していますか？',
    options: COMMON_OPTIONS,
    axis: 'improvement',
  },

  // 【事業力】
  {
    id: 10,
    question: 'Threadsから案内できる商品・サービスがありますか？',
    options: COMMON_OPTIONS,
    axis: 'business',
  },
  {
    id: 11,
    question: 'Threadsから商品までの導線は整っていますか？',
    options: COMMON_OPTIONS,
    axis: 'business',
  },
  {
    id: 12,
    question: 'Threadsをきっかけに、実際に売上が発生したことはありますか？',
    options: COMMON_OPTIONS,
    axis: 'business',
  },
];
