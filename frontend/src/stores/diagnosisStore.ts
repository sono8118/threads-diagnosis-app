// ============================================================================
// Zustandストア - 診断状態管理
// ============================================================================

import { create } from 'zustand';
import type { Answer } from '../types';

interface DiagnosisState {
  // 状態
  currentQuestionIndex: number; // 現在の質問インデックス（0〜11）
  answers: Answer[]; // 回答リスト
  hasConsented: boolean; // 同意チェック

  // アクション
  setConsent: (consented: boolean) => void;
  setAnswer: (questionId: number, value: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  reset: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  // 初期状態
  currentQuestionIndex: 0,
  answers: [],
  hasConsented: false,

  // 同意設定
  setConsent: (consented) => set({ hasConsented: consented }),

  // 回答設定
  setAnswer: (questionId, value) =>
    set((state) => {
      const existingIndex = state.answers.findIndex((a) => a.questionId === questionId);

      if (existingIndex >= 0) {
        // 既存の回答を更新
        const newAnswers = [...state.answers];
        newAnswers[existingIndex] = { questionId: questionId as Answer['questionId'], value: value as Answer['value'] };
        return { answers: newAnswers };
      } else {
        // 新しい回答を追加
        return { answers: [...state.answers, { questionId: questionId as Answer['questionId'], value: value as Answer['value'] }] };
      }
    }),

  // 次の質問へ
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, 11),
    })),

  // 前の質問へ
  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),

  // リセット
  reset: () =>
    set({
      currentQuestionIndex: 0,
      answers: [],
      hasConsented: false,
    }),
}));
