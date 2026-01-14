// ============================================================================
// 型定義 - Threads運用診断アプリ
// ============================================================================

// ----------------------------------------------------------------------------
// 回答関連
// ----------------------------------------------------------------------------

/**
 * 1問の回答
 */
export interface Answer {
  questionId: number; // 質問番号（1〜12）
  value: number; // 選択した点数（0, 3, 6, 8）
}

/**
 * 選択肢
 */
export interface Choice {
  label: string; // 選択肢のラベル
  value: number; // 選択肢の点数
}

/**
 * 質問
 */
export interface Question {
  id: number; // 質問番号（1〜12）
  text: string; // 質問文
  subText?: string; // 補足テキスト（任意）
  choices: Choice[]; // 4つの選択肢
  axis: AxisKey; // この質問が属する軸
}

// ----------------------------------------------------------------------------
// 診断軸関連
// ----------------------------------------------------------------------------

/**
 * 4つの診断軸
 */
export type AxisKey = 'design' | 'production' | 'improvement' | 'business';

/**
 * 軸ごとのスコア
 */
export interface AxisScores {
  design: number; // 設計力
  production: number; // 量産力
  improvement: number; // 改善力
  business: number; // 事業力
}

// ----------------------------------------------------------------------------
// 診断結果関連
// ----------------------------------------------------------------------------

/**
 * 診断タイプ（T1〜T4）
 */
export type DiagnosisType = 'T1' | 'T2' | 'T3' | 'T4';

/**
 * 診断結果
 */
export interface DiagnosisResult {
  rawScores: AxisScores; // 生スコア（0-24点）
  normalizedScores: AxisScores; // 正規化スコア（0-100点）
  totalScore: number; // 合計点（0-100点）
  diagnosisType: DiagnosisType; // 診断タイプ（T1〜T4）
  isZeroScore: boolean; // 全0点か
  isExcellent: boolean; // 全85点以上か
  lowestAxis: AxisKey; // 最低スコアの軸
}

// ----------------------------------------------------------------------------
// セッションストレージ関連
// ----------------------------------------------------------------------------

/**
 * 診断セッションデータ（sessionStorageに保存）
 */
export interface DiagnosisSession {
  answers: Answer[]; // 12問の回答
  computedScores: AxisScores; // 計算済みスコア
  computedType: DiagnosisType; // 計算済みタイプ
  timestamp: number; // 作成日時（UnixTime）
}

// ----------------------------------------------------------------------------
// カスタムメッセージエンジン関連
// ----------------------------------------------------------------------------

/**
 * メッセージルール条件
 */
export interface MessageCondition {
  axis?: AxisKey; // 特定の軸
  min?: number; // 最小スコア
  max?: number; // 最大スコア
  type?: DiagnosisType; // 特定のタイプ
  isZeroScore?: boolean; // 全0点か
  isExcellent?: boolean; // 全85点以上か
}

/**
 * メッセージルール
 */
export interface MessageRule {
  id: string; // ルール識別子
  priority: number; // 優先度（高いほど優先）
  conditions: MessageCondition[]; // 条件リスト（AND条件）
  message: string; // 表示メッセージ
  enabled: boolean; // 有効/無効
}

// ----------------------------------------------------------------------------
// タイプ定義関連
// ----------------------------------------------------------------------------

/**
 * タイプ情報
 */
export interface TypeInfo {
  type: DiagnosisType;
  title: string; // タイプタイトル
  description: string; // タイプ説明
  advice: string[]; // アドバイスリスト
  ctaText: string; // CTA文言
}

// ----------------------------------------------------------------------------
// Google Analytics 4 関連
// ----------------------------------------------------------------------------

/**
 * GA4イベントパラメータ（共通）
 */
export interface GA4EventParams {
  diagnosis_type: DiagnosisType;
  diagnosis_score: number;
  timestamp: string; // ISO8601形式
}

/**
 * GA4イベント名
 */
export type GA4EventName =
  | 'Diagnosis_Start'
  | 'Diagnosis_Complete'
  | 'Result_View'
  | 'CTA_Click'
  | 'Benefit_Register'
  | 'LP_Click';

// ----------------------------------------------------------------------------
// UTAGE関連
// ----------------------------------------------------------------------------

/**
 * UTAGEパラメータ
 */
export interface UtageParams {
  email: string;
  type: DiagnosisType;
  score: number;
}

// ----------------------------------------------------------------------------
// URL生成関連
// ----------------------------------------------------------------------------

/**
 * UTMパラメータ
 */
export interface UtmParams {
  utm_source: string; // 固定: 'diagnosis'
  utm_medium: string; // 固定: 'app'
  utm_campaign: string; // 固定: 'threads_manager'
  utm_content: DiagnosisType; // タイプ別: T1/T2/T3/T4
  utm_term: string; // スコア別: 'score_N'
}
