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
    10: 'continuation',
    11: 'continuation',
    12: 'continuation',
  };

  // 軸ごとのスコアを集計
  const scores: AxisScores = {
    design: 0,
    production: 0,
    improvement: 0,
    continuation: 0,
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
    continuation: Math.round((rawScores.continuation / maxScore) * 100),
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
    normalizedScores.continuation;

  return Math.round(sum / 4);
}

// ----------------------------------------------------------------------------
// タイプ判定
// ----------------------------------------------------------------------------

/**
 * 最低スコアの軸を特定
 *
 * 同点時の優先順位:
 * - 低～中スコア（80点未満の軸がある）: continuation > design > production > improvement
 * - 高得点（全軸80点以上）: improvement > continuation > production > design
 */
function findLowestAxis(rawScores: AxisScores, normalizedScores: AxisScores): AxisKey {
  // 全軸が高得点（80点以上）かチェック
  const allHighScore = Object.values(normalizedScores).every((score) => score >= 80);

  // 優先順位の定義（配列の順序 = 優先度）
  const axes: AxisKey[] = allHighScore
    ? ['improvement', 'continuation', 'production', 'design']
    : ['continuation', 'design', 'production', 'improvement'];

  // 最低スコアを計算
  const minScore = Math.min(...axes.map((axis) => rawScores[axis]));

  // 最低スコアと同点で、優先順位が最も高い軸を返す
  // (配列の先頭から順に探すことで、優先順位を考慮)
  const lowestAxis = axes.find((axis) => rawScores[axis] === minScore);

  return lowestAxis || axes[0];
}

/**
 * 最低軸からタイプを判定
 */
function determineDiagnosisType(lowestAxis: AxisKey): DiagnosisType {
  const typeMapping: Record<AxisKey, DiagnosisType> = {
    design: 'T1',
    production: 'T2',
    improvement: 'T3',
    continuation: 'T4',
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

  // 5. タイプ判定（特別判定優先）
  let diagnosisType: DiagnosisType;
  let lowestAxis: AxisKey;

  if (isZeroScore) {
    // 全0点の場合は「はじまりタイプ」
    diagnosisType = 'BEGINNER';
    // 最低軸は形式的にdesignにしておく（実際には使われない）
    lowestAxis = 'design';
  } else if (isExcellent) {
    // 全軸85点以上の場合は「安定成長タイプ」
    diagnosisType = 'BALANCED';
    // 最低軸は形式的にcontinuationにしておく（実際には使われない）
    lowestAxis = 'continuation';
  } else {
    // 通常の判定: 最低軸を特定してタイプ判定
    lowestAxis = findLowestAxis(rawScores, normalizedScores);
    diagnosisType = determineDiagnosisType(lowestAxis);
  }

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
