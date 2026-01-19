// ============================================================================
// カスタムメッセージエンジン - 評価ロジック
// ============================================================================

import { MESSAGE_RULES } from '../constants/MESSAGE_RULES';
import type {
  DiagnosisResult,
  Answer,
  Condition,
  Conditions,
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
 * カスタムメッセージを生成する
 *
 * 生成ルール:
 * 1. 主メッセージ（タイプ別、必ず1つ）
 * 2. 刺さる指摘（優先度順に評価、最大2つ）
 *
 * 評価フロー:
 * 1. enabled: true のルールのみを対象
 * 2. 条件評価（evaluateConditions）
 * 3. 優先度でソート（降順）
 * 4. 上位2件を取得
 *
 * @param diagnosisResult - 診断結果データ
 * @param answers - 回答データ
 * @returns カスタムメッセージの配列（最大3つ: 主メッセージ + 刺さる指摘2つ）
 */
export function generateCustomMessages(
  diagnosisResult: DiagnosisResult,
  answers: Answer[]
): string[] {
  // 1. 主メッセージ（タイプ別、必ず1つ）
  const mainMessage = MESSAGE_RULES.mainMessages[diagnosisResult.diagnosisType];

  // 2. 刺さる指摘（優先度順に評価、最大2つ）
  const matchedRules = MESSAGE_RULES.rules
    .filter((rule) => rule.enabled) // ① 有効なルールのみ
    .filter((rule) => evaluateConditions(rule.conditions, diagnosisResult, answers)) // ② 条件にマッチするルール
    .sort((a, b) => b.priority - a.priority) // ③ 優先度で降順ソート
    .slice(0, 2); // ④ 最大2つを抽出

  // 3. 結合（主メッセージ + 刺さる指摘1-2）
  return [mainMessage, ...matchedRules.map((r) => r.message)];
}
