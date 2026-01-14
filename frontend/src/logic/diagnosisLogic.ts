// ============================================================================
// 診断ロジック - スコア計算とタイプ判定
// ============================================================================

import type {
  Answer,
  AxisKey,
  AxisScores,
  DiagnosisResult,
  DiagnosisType,
} from '../types';

// ----------------------------------------------------------------------------
// スコア計算
// ----------------------------------------------------------------------------

/**
 * 軸ごとのスコアを計算（各軸3問×8点=24点満点）
 */
function calculateAxisScores(answers: Answer[]): AxisScores {
  // 質問IDと軸のマッピング
  const axisMapping: Record<number, AxisKey> = {
    1: 'design',
    2: 'design',
    3: 'design',
    4: 'production',
    5: 'production',
    6: 'production',
    7: 'improvement',
    8: 'improvement',
    9: 'improvement',
    10: 'business',
    11: 'business',
    12: 'business',
  };

  // 軸ごとのスコアを集計
  const scores: AxisScores = {
    design: 0,
    production: 0,
    improvement: 0,
    business: 0,
  };

  answers.forEach((answer) => {
    const axis = axisMapping[answer.questionId];
    scores[axis] += answer.value;
  });

  return scores;
}

/**
 * 生スコアを100点換算に正規化
 */
function normalizeScores(rawScores: AxisScores): AxisScores {
  const maxScore = 24; // 各軸3問×8点

  return {
    design: Math.round((rawScores.design / maxScore) * 100),
    production: Math.round((rawScores.production / maxScore) * 100),
    improvement: Math.round((rawScores.improvement / maxScore) * 100),
    business: Math.round((rawScores.business / maxScore) * 100),
  };
}

/**
 * 合計点を計算（4軸の平均）
 */
function calculateTotalScore(normalizedScores: AxisScores): number {
  const sum =
    normalizedScores.design +
    normalizedScores.production +
    normalizedScores.improvement +
    normalizedScores.business;

  return Math.round(sum / 4);
}

// ----------------------------------------------------------------------------
// タイプ判定
// ----------------------------------------------------------------------------

/**
 * 最低スコアの軸を特定（同点時は優先順位: design > production > improvement > business）
 */
function findLowestAxis(rawScores: AxisScores): AxisKey {
  const axes: AxisKey[] = ['design', 'production', 'improvement', 'business'];

  let lowestAxis: AxisKey = 'design';
  let lowestScore = rawScores.design;

  // 同点時の優先順位を考慮して順番に評価
  axes.forEach((axis) => {
    if (rawScores[axis] < lowestScore) {
      lowestScore = rawScores[axis];
      lowestAxis = axis;
    }
  });

  return lowestAxis;
}

/**
 * 最低軸からタイプを判定
 */
function determineDiagnosisType(lowestAxis: AxisKey): DiagnosisType {
  const typeMapping: Record<AxisKey, DiagnosisType> = {
    design: 'T1',
    production: 'T2',
    improvement: 'T3',
    business: 'T4',
  };

  return typeMapping[lowestAxis];
}

// ----------------------------------------------------------------------------
// メイン診断ロジック
// ----------------------------------------------------------------------------

/**
 * 診断結果を計算
 * @param answers 12問の回答
 * @returns 診断結果
 */
export function calculateDiagnosis(answers: Answer[]): DiagnosisResult {
  // 1. 軸ごとのスコア計算（生スコア：0-24点）
  const rawScores = calculateAxisScores(answers);

  // 2. 100点換算
  const normalizedScores = normalizeScores(rawScores);

  // 3. 合計点
  const totalScore = calculateTotalScore(normalizedScores);

  // 4. 特別判定
  const isZeroScore = Object.values(rawScores).every((score) => score === 0);
  const isExcellent = Object.values(normalizedScores).every((score) => score >= 85);

  // 5. 最低軸特定
  const lowestAxis = findLowestAxis(rawScores);

  // 6. タイプ判定
  const diagnosisType = determineDiagnosisType(lowestAxis);

  return {
    rawScores,
    normalizedScores,
    totalScore,
    diagnosisType,
    isZeroScore,
    isExcellent,
    lowestAxis,
  };
}
