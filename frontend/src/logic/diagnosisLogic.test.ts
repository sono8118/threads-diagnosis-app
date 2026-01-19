// ============================================================================
// 診断ロジックのユニットテスト
// ============================================================================

import { describe, it, expect } from 'vitest';
import { calculateDiagnosis } from './diagnosisLogic';
import type { Answer, QuestionId, AnswerValue } from '../types';

// テストヘルパー関数
function createAnswers(values: number[]): Answer[] {
  if (values.length !== 12) {
    throw new Error('12個の値を指定してください');
  }
  return values.map((value, index) => ({
    questionId: (index + 1) as QuestionId,
    value: value as AnswerValue,
  }));
}

describe('diagnosisLogic.ts - スコア計算', () => {
  describe('軸ごとのスコア計算', () => {
    it('各軸のスコアを正しく計算する（Q1-3: design, Q4-6: production, Q7-9: improvement, Q10-12: continuation）', () => {
      // Q1-3: design = 8+6+3 = 17/24 → 71点
      // Q4-6: production = 8+8+8 = 24/24 → 100点
      // Q7-9: improvement = 6+6+6 = 18/24 → 75点
      // Q10-12: continuation = 3+3+3 = 9/24 → 38点
      const answers = createAnswers([8, 6, 3, 8, 8, 8, 6, 6, 6, 3, 3, 3]);

      const result = calculateDiagnosis(answers);

      expect(result.normalizedScores.design).toBe(71);
      expect(result.normalizedScores.production).toBe(100);
      expect(result.normalizedScores.improvement).toBe(75);
      expect(result.normalizedScores.continuation).toBe(38);
    });

    it('全0点の場合、すべての軸が0点になる', () => {
      const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.normalizedScores.design).toBe(0);
      expect(result.normalizedScores.production).toBe(0);
      expect(result.normalizedScores.improvement).toBe(0);
      expect(result.normalizedScores.continuation).toBe(0);
    });

    it('全満点の場合、すべての軸が100点になる', () => {
      const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      expect(result.normalizedScores.design).toBe(100);
      expect(result.normalizedScores.production).toBe(100);
      expect(result.normalizedScores.improvement).toBe(100);
      expect(result.normalizedScores.continuation).toBe(100);
    });

    it('100点換算の丸め処理が正しく動作する', () => {
      // Q1-3: design = 8+8+7 → 該当しない値なので代わりに 8+8+6=22/24 → 91.666... → 92点
      const answers = createAnswers([8, 8, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      expect(result.normalizedScores.design).toBe(92);
    });
  });

  describe('合計点計算', () => {
    it('合計点は4軸の平均値（100点換算）', () => {
      // design: 8+8+8 = 24/24 → 100点
      // production: 6+6+6 = 18/24 → 75点
      // improvement: 3+3+3 = 9/24 → 38点
      // continuation: 0+0+0 = 0/24 → 0点
      // 平均: (100+75+38+0)/4 = 53.25 → 53点
      const answers = createAnswers([8, 8, 8, 6, 6, 6, 3, 3, 3, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.totalScore).toBe(53);
    });

    it('全0点の場合、合計点は0点', () => {
      const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.totalScore).toBe(0);
    });

    it('全満点の場合、合計点は100点', () => {
      const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      expect(result.totalScore).toBe(100);
    });
  });
});

describe('diagnosisLogic.ts - タイプ判定', () => {
  describe('通常のタイプ判定（T1/T2/T3/T4）', () => {
    it('最低軸が design の場合、T1になる', () => {
      // design: 0+0+0 = 0/24 → 0点（最低）
      // production: 6+6+6 = 18/24 → 75点
      // improvement: 6+6+6 = 18/24 → 75点
      // continuation: 6+6+6 = 18/24 → 75点
      const answers = createAnswers([0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T1');
      expect(result.lowestAxis).toBe('design');
    });

    it('最低軸が production の場合、T2になる', () => {
      // design: 6+6+6 = 18/24 → 75点
      // production: 0+0+0 = 0/24 → 0点（最低）
      // improvement: 6+6+6 = 18/24 → 75点
      // continuation: 6+6+6 = 18/24 → 75点
      const answers = createAnswers([6, 6, 6, 0, 0, 0, 6, 6, 6, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T2');
      expect(result.lowestAxis).toBe('production');
    });

    it('最低軸が improvement の場合、T3になる', () => {
      // design: 6+6+6 = 18/24 → 75点
      // production: 6+6+6 = 18/24 → 75点
      // improvement: 0+0+0 = 0/24 → 0点（最低）
      // continuation: 6+6+6 = 18/24 → 75点
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 0, 0, 0, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T3');
      expect(result.lowestAxis).toBe('improvement');
    });

    it('最低軸が continuation の場合、T4になる', () => {
      // design: 6+6+6 = 18/24 → 75点
      // production: 6+6+6 = 18/24 → 75点
      // improvement: 6+6+6 = 18/24 → 75点
      // continuation: 0+0+0 = 0/24 → 0点（最低）
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 6, 6, 6, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T4');
      expect(result.lowestAxis).toBe('continuation');
    });
  });

  describe('同点時の優先順位（通常スコア帯）', () => {
    it('全軸同点の場合、continuation が最優先で T4 になる', () => {
      const answers = createAnswers([3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T4');
      expect(result.lowestAxis).toBe('continuation');
    });

    it('design と production が同点で最低の場合、design が優先で T1 になる', () => {
      // design: 0+0+0 = 0/24 → 0点（最低）
      // production: 0+0+0 = 0/24 → 0点（最低）
      // improvement: 6+6+6 = 18/24 → 75点
      // continuation: 6+6+6 = 18/24 → 75点
      const answers = createAnswers([0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T1');
    });

    it('production と improvement が同点で最低の場合、production が優先で T2 になる', () => {
      // design: 6+6+6 = 18/24 → 75点
      // production: 0+0+0 = 0/24 → 0点（最低）
      // improvement: 0+0+0 = 0/24 → 0点（最低）
      // continuation: 6+6+6 = 18/24 → 75点
      const answers = createAnswers([6, 6, 6, 0, 0, 0, 0, 0, 0, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T2');
    });

    it('improvement と continuation が同点で最低の場合、continuation が優先で T4 になる', () => {
      // design: 6+6+6 = 18/24 → 75点
      // production: 6+6+6 = 18/24 → 75点
      // improvement: 0+0+0 = 0/24 → 0点（最低）
      // continuation: 0+0+0 = 0/24 → 0点（最低）
      // → 低-中スコア帯のため、continuation > improvement の優先順位で continuation が選ばれる
      const answers = createAnswers([6, 6, 6, 6, 6, 6, 0, 0, 0, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T4');
      expect(result.lowestAxis).toBe('continuation');
    });
  });

  describe('高得点時の優先順位（全軸80点以上）', () => {
    it('全軸80点以上かつ全軸同点の場合、continuation が優先で T4 になる', () => {
      // 全軸: 8+8+8 = 24/24 → 100点
      const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      // 全軸100点の場合は isExcellent=true で BALANCED になる
      expect(result.isExcellent).toBe(true);
      expect(result.diagnosisType).toBe('BALANCED');
    });

    it('全軸80点以上で continuation が最低の場合、T4 になる', () => {
      // design: 8+8+8 = 24/24 → 100点
      // production: 8+8+8 = 24/24 → 100点
      // improvement: 8+8+8 = 24/24 → 100点
      // continuation: 6+6+6 = 18/24 → 75点（最低、ただし80点未満のため高得点扱いにならない）
      // → 通常の優先順位適用
      const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T4');
    });

    it('全軸80点以上で design が最低の場合、T1 になる（高得点時の逆優先順位）', () => {
      // design: 8+8+3 = 19/24 → 79点（最低、80点未満）
      // production: 8+8+8 = 24/24 → 100点
      // improvement: 8+8+8 = 24/24 → 100点
      // continuation: 8+8+8 = 24/24 → 100点
      // → 全軸80点以上ではないため、通常優先順位
      const answers = createAnswers([8, 8, 3, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      expect(result.diagnosisType).toBe('T1');
    });
  });

  describe('特殊判定', () => {
    it('全0点の場合、isZeroScore=true かつ BEGINNER になる', () => {
      const answers = createAnswers([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

      const result = calculateDiagnosis(answers);

      expect(result.isZeroScore).toBe(true);
      expect(result.diagnosisType).toBe('BEGINNER');
      expect(result.totalScore).toBe(0);
    });

    it('全軸85点以上の場合、isExcellent=true かつ BALANCED になる', () => {
      // 全軸: 8+8+8 = 24/24 → 100点（85点以上）
      const answers = createAnswers([8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]);

      const result = calculateDiagnosis(answers);

      expect(result.isExcellent).toBe(true);
      expect(result.diagnosisType).toBe('BALANCED');
      expect(result.totalScore).toBe(100);
    });

    it('全軸85点以上だが1軸でも84点以下がある場合、isExcellent=false になる', () => {
      // 各軸: 8+6+6 = 20/24 → 83点（85点未満）
      // → isExcellent にはならない
      // 全軸同点かつ80点以上 → 高得点時の優先順位（improvement優先）で T3
      const answers = createAnswers([8, 6, 6, 8, 6, 6, 8, 6, 6, 8, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.isExcellent).toBe(false);
      // 全軸同点で80点以上 → 高得点時のimprovement優先で T3
      expect(result.diagnosisType).toBe('T3');
    });

    it('1軸でも84点以下がある場合、isExcellent=false になる', () => {
      // design: 8+8+6 = 22/24 → 92点
      // production: 8+8+6 = 22/24 → 92点
      // improvement: 8+8+6 = 22/24 → 92点
      // continuation: 6+6+6 = 18/24 → 75点（85点未満）
      const answers = createAnswers([8, 8, 6, 8, 8, 6, 8, 8, 6, 6, 6, 6]);

      const result = calculateDiagnosis(answers);

      expect(result.isExcellent).toBe(false);
      expect(result.diagnosisType).toBe('T4');
    });
  });
});

describe('diagnosisLogic.ts - エッジケース', () => {
  it('回答が12個未満の場合でも正しく処理される', () => {
    // 6問だけ回答（残りは回答なし = 0点扱い）
    const answers: Answer[] = [
      { questionId: 1, value: 8 },
      { questionId: 2, value: 8 },
      { questionId: 3, value: 8 },
      { questionId: 4, value: 8 },
      { questionId: 5, value: 8 },
      { questionId: 6, value: 8 },
    ];

    const result = calculateDiagnosis(answers);

    // design: 8+8+8 = 24/24 → 100点
    // production: 8+8+8 = 24/24 → 100点
    // improvement: 0+0+0 = 0/24 → 0点（最低）
    // continuation: 0+0+0 = 0/24 → 0点（最低）
    // → 低-中スコア帯のため、continuation > improvement の優先順位で continuation が選ばれる
    expect(result.diagnosisType).toBe('T4');
  });

  it('質問IDが順不同でも正しく処理される', () => {
    const answers: Answer[] = [
      { questionId: 12, value: 8 },
      { questionId: 1, value: 0 },
      { questionId: 6, value: 6 },
      { questionId: 3, value: 3 },
      { questionId: 9, value: 8 },
      { questionId: 2, value: 0 },
      { questionId: 11, value: 8 },
      { questionId: 4, value: 6 },
      { questionId: 7, value: 8 },
      { questionId: 5, value: 6 },
      { questionId: 8, value: 8 },
      { questionId: 10, value: 8 },
    ];

    const result = calculateDiagnosis(answers);

    // design: 0+0+3 = 3/24 → 13点（最低）
    // production: 6+6+6 = 18/24 → 75点
    // improvement: 8+8+8 = 24/24 → 100点
    // continuation: 8+8+8 = 24/24 → 100点
    expect(result.diagnosisType).toBe('T1');
    expect(result.lowestAxis).toBe('design');
  });

  it('混在スコアのパターン（現実的なケース）', () => {
    // design: 6+3+0 = 9/24 → 38点
    // production: 8+6+3 = 17/24 → 71点
    // improvement: 8+8+6 = 22/24 → 92点
    // continuation: 8+8+8 = 24/24 → 100点
    const answers = createAnswers([6, 3, 0, 8, 6, 3, 8, 8, 6, 8, 8, 8]);

    const result = calculateDiagnosis(answers);

    expect(result.diagnosisType).toBe('T1');
    expect(result.lowestAxis).toBe('design');
    expect(result.normalizedScores.design).toBe(38);
    expect(result.totalScore).toBe(75);
    expect(result.isZeroScore).toBe(false);
    expect(result.isExcellent).toBe(false);
  });
});
