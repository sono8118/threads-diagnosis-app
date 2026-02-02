// ============================================================================
// カスタムメッセージエンジン - 評価ロジック
// ============================================================================

import { MESSAGE_RULES } from '../constants/MESSAGE_RULES';
import type {
  DiagnosisResult,
  Answer,
  Condition,
  Conditions,
  MessageRule,
  AxisKey,
} from '../types';

/**
 * 単一の条件を評価する
 *
 * @param condition - 評価する条件
 * @param diagnosisResult - 診断結果データ
 * @param answers - 回答データ
 * @returns 条件を満たす場合はtrue、そうでない場合はfalse
 */
function evaluateCondition(
  condition: Condition,
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): boolean {
  const { field, operator, value } = condition;

  // フィールド値を取得
  let fieldValue: number;

  if (field === 'totalScore') {
    // 総合スコア
    fieldValue = diagnosisResult.totalScore;
  } else if (field.startsWith('Q')) {
    // 個別質問（Q1-Q12）
    const questionId = parseInt(field.substring(1), 10);
    const answer = answers.find((a) => a.questionId === questionId);
    fieldValue = answer ? answer.value : 0;
  } else {
    // 軸スコア（design, production, improvement, continuation）
    const axisKey = field as 'design' | 'production' | 'improvement' | 'continuation';
    fieldValue = diagnosisResult.normalizedScores[axisKey];
  }

  // オペレーターで比較
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'greaterThan':
      return fieldValue > value;
    case 'lessThan':
      return fieldValue < value;
    case 'greaterThanOrEqual':
      return fieldValue >= value;
    case 'lessThanOrEqual':
      return fieldValue <= value;
    default:
      return false;
  }
}

/**
 * 条件グループ（AND/OR）を評価する
 *
 * @param conditions - 評価する条件グループ
 * @param diagnosisResult - 診断結果データ
 * @param answers - 回答データ
 * @returns 条件グループを満たす場合はtrue、そうでない場合はfalse
 */
function evaluateConditions(
  conditions: Conditions,
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): boolean {
  const { logic, conditions: conditionList } = conditions;

  if (logic === 'AND') {
    // すべての条件を満たす必要がある
    return conditionList.every((c) => evaluateCondition(c, diagnosisResult, answers));
  } else {
    // いずれかの条件を満たせば良い
    return conditionList.some((c) => evaluateCondition(c, diagnosisResult, answers));
  }
}

/**
 * 🆕 質問IDから軸キーを取得
 *
 * @param questionId - 質問ID（1-12）
 * @returns 軸キー、または該当なしの場合はnull
 */
function getAxisKeyForQuestion(questionId: number): AxisKey | null {
  if (questionId >= 1 && questionId <= 3) return 'design';
  if (questionId >= 4 && questionId <= 6) return 'production';
  if (questionId >= 7 && questionId <= 9) return 'improvement';
  if (questionId >= 10 && questionId <= 12) return 'continuation';
  return null;
}

/**
 * 🆕 動的優先度を計算
 *
 * 計算式: dynamicPriority = basePriority + (deficit * 3) + (axisDeficit * 0.1)
 * - deficit: 質問レベルの不足量（8 - questionValue）
 * - axisDeficit: 軸レベルの不足量（100 - axisScore）
 *
 * @param rule - メッセージルール
 * @param diagnosisResult - 診断結果データ
 * @param answers - 回答データ
 * @returns 動的に調整された優先度
 */
function calculateDynamicPriority(
  rule: MessageRule,
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): number {
  let totalDeficit = 0;
  let totalAxisDeficit = 0;
  let conditionCount = 0;

  // 条件からdeficitを計算
  const conditions = rule.conditions.conditions;

  for (const condition of conditions) {
    if (condition.field.startsWith('Q')) {
      // 質問レベルのdeficit
      const questionId = parseInt(condition.field.substring(1), 10);
      const answer = answers.find((a) => a.questionId === questionId);
      const questionValue = answer ? answer.value : 0;
      const deficit = 8 - questionValue;
      totalDeficit += deficit;
      conditionCount++;

      // 軸レベルのdeficit
      const axisKey = getAxisKeyForQuestion(questionId);
      if (axisKey) {
        const axisScore = diagnosisResult.normalizedScores[axisKey];
        const axisDeficit = 100 - axisScore;
        totalAxisDeficit += axisDeficit;
      }
    }
  }

  // 平均deficit
  const avgDeficit = conditionCount > 0 ? totalDeficit / conditionCount : 0;
  const avgAxisDeficit = conditionCount > 0 ? totalAxisDeficit / conditionCount : 0;

  // 動的優先度 = 基本優先度 + (deficit * 3) + (axisDeficit * 0.1)
  return rule.priority + avgDeficit * 3 + avgAxisDeficit * 0.1;
}

/**
 * カスタムメッセージを生成する
 *
 * 生成ルール:
 * 1. 主メッセージ（タイプ別、必ず1つ）
 * 2. 刺さる指摘（優先度順に評価、最大2つ）
 *
 * 評価フロー:
 * 1. enabled: true のルールのみを対象
 * 2. 条件評価（evaluateConditions）
 * 3. 🆕 HIGH帯ガード（総合80点以上でhard指摘を除外）
 * 4. 🆕 動的優先度を計算
 * 5. 優先度でソート（降順）
 * 6. 上位2件を取得
 *
 * @param diagnosisResult - 診断結果データ
 * @param answers - 回答データ
 * @returns カスタムメッセージの配列（最大3つ: 主メッセージ + 刺さる指摘2つ）
 */
export function generateCustomMessages(
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): string[] {
  // 🆕 1. 総合スコア帯を判定
  const totalScore = diagnosisResult.totalScore;
  const overallBand = totalScore >= 80 ? 'HIGH' : totalScore >= 60 ? 'MID' : 'LOW';

  // 2. 主メッセージ（タイプ別、必ず1つ）
  const mainMessage = MESSAGE_RULES.mainMessages[diagnosisResult.diagnosisType];

  // 3. 刺さる指摘（優先度順に評価、最大2つ）
  const matchedRules = MESSAGE_RULES.rules
    .filter((rule) => rule.enabled) // ① 有効なルールのみ
    .filter((rule) => evaluateConditions(rule.conditions, diagnosisResult, answers)) // ② 条件にマッチするルール
    // 🆕 ③ HIGH帯の場合、hard指摘を除外
    .filter((rule) => {
      if (overallBand === 'HIGH' && rule.severity === 'hard') {
        return false;
      }
      return true;
    })
    // 🆕 ④ 動的優先度を計算
    .map((rule) => ({
      ...rule,
      dynamicPriority: calculateDynamicPriority(rule, diagnosisResult, answers),
    }))
    // ⑤ 動的優先度で降順ソート
    .sort((a, b) => b.dynamicPriority - a.dynamicPriority)
    // ⑥ 最大2つを抽出
    .slice(0, 2);

  // 4. 結合（主メッセージ + 刺さる指摘1-2）
  return [mainMessage, ...matchedRules.map((r) => r.message)];
}
