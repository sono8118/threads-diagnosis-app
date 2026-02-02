// ============================================================================
// Threads運用診断アプリ - 型定義
// ============================================================================

// ----------------------------------------------------------------------------
// 診断関連の型
// ----------------------------------------------------------------------------

/**
 * 診断タイプ
 * 🆕 MIXタイプ追加（2026-01-30）: 複数軸が同時に弱い状態
 */
export type DiagnosisType =
  | 'BEGINNER'
  | 'T1'
  | 'T2'
  | 'T3'
  | 'T4'
  | 'BALANCED'
  | 'T1T2-MIX'  // 🆕 設計力と量産力が同時に弱い
  | 'T1T3-MIX'  // 🆕 設計力と改善力が同時に弱い
  | 'T1T4-MIX'  // 🆕 設計力と継続力が同時に弱い
  | 'T2T3-MIX'  // 🆕 量産力と改善力が同時に弱い
  | 'T2T4-MIX'  // 🆕 量産力と継続力が同時に弱い
  | 'T3T4-MIX'; // 🆕 改善力と継続力が同時に弱い

/**
 * 回答値（0点、3点、6点、8点）
 */
export type AnswerValue = 0 | 3 | 6 | 8;

/**
 * 4軸スコアのキー
 */
export type AxisKey = 'design' | 'production' | 'improvement' | 'continuation';

/**
 * 質問ID（1-12）
 */
export type QuestionId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * 回答データ
 */
export interface Answer {
  /** 質問ID（1-12） */
  questionId: QuestionId;
  /** 選択した点数（0、3、6、8） */
  value: AnswerValue;
}

/**
 * 4軸スコア（0-100点換算）
 */
export interface AxisScores {
  /** 設計力（戦略） */
  design: number;
  /** 量産力（実行力） */
  production: number;
  /** 改善力（PDCA） */
  improvement: number;
  /** 継続力（仕組みと習慣） */
  continuation: number;
}

/**
 * 診断セッションデータ（sessionStorageに保存）
 */
export interface DiagnosisSession {
  /** 12問の回答 */
  answers: Answer[];
  /** 4軸スコア（0-100点換算） */
  computedScores: AxisScores;
  /** タイプ判定結果（T1/T2/T3/T4） */
  computedType: DiagnosisType;
  /** カスタムメッセージ（最大3つ: 主メッセージ + 刺さる指摘2つ） */
  customMessages: string[];
  /** 最低スコアの軸（優先順位を考慮） */
  lowestAxis: AxisKey;
  /** セッション作成日時（Unix timestamp） */
  timestamp: number;
}

/**
 * 診断結果（診断ロジックの出力）
 */
export interface DiagnosisResult {
  /** 4軸の生スコア（0-24点） */
  rawScores: AxisScores;
  /** 4軸の正規化スコア（0-100点） */
  normalizedScores: AxisScores;
  /** 合計点（0-100点） */
  totalScore: number;
  /** タイプ判定結果 */
  diagnosisType: DiagnosisType;
  /** 全0点フラグ */
  isZeroScore: boolean;
  /** 優秀フラグ（全軸85点以上） */
  isExcellent: boolean;
  /** 最低スコアの軸 */
  lowestAxis: AxisKey;
}

// ----------------------------------------------------------------------------
// 質問関連の型
// ----------------------------------------------------------------------------

/**
 * 質問の選択肢
 */
export interface QuestionOption {
  /** ラベル */
  label: string;
  /** 点数（0、3、6、8） */
  value: AnswerValue;
}

/**
 * 質問データ
 */
export interface Question {
  /** 質問ID（1-12） */
  id: QuestionId;
  /** 質問文（メインテキスト） */
  question: string;
  /** サブテキスト（補足説明・任意） */
  subText?: string;
  /** 軸カテゴリ */
  axis: AxisKey;
  /** 選択肢（4択） */
  options: QuestionOption[];
}

// ----------------------------------------------------------------------------
// 診断ページUI状態管理の型
// ----------------------------------------------------------------------------

/**
 * 診断画面の表示状態
 */
export type DiagnosisScreenState = 'start' | 'question' | 'complete';

/**
 * 診断ページの進捗状態
 */
export interface DiagnosisProgress {
  /** 現在の質問番号（1-12） */
  currentQuestionNumber: number;
  /** 残り質問数 */
  remainingQuestions: number;
  /** 進捗率（0-100%） */
  progressPercent: number;
}

/**
 * 同意チェックボックスの状態
 */
export interface ConsentState {
  /** チェック状態 */
  checked: boolean;
}

/**
 * 診断ナビゲーションの制御状態
 */
export interface DiagnosisNavigation {
  /** 「次へ」ボタンの有効/無効 */
  canProceed: boolean;
  /** 「戻る」ボタンの表示/非表示 */
  canGoBack: boolean;
  /** 現在の質問に回答済みか */
  isCurrentQuestionAnswered: boolean;
}

// ----------------------------------------------------------------------------
// カスタムメッセージエンジン関連の型
// ----------------------------------------------------------------------------

/**
 * 条件演算子
 */
export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual';

/**
 * 条件フィールド
 */
export type ConditionField = 'totalScore' | `Q${QuestionId}` | AxisKey;

/**
 * 個別条件
 */
export interface Condition {
  /** 評価対象フィールド */
  field: ConditionField;
  /** 演算子 */
  operator: ConditionOperator;
  /** 比較値 */
  value: number;
}

/**
 * 条件グループ
 */
export interface Conditions {
  /** 論理演算（AND/OR） */
  logic: 'AND' | 'OR';
  /** 条件リスト */
  conditions: Condition[];
}

/**
 * メッセージルール
 * 🆕 severity追加（2026-01-30）: HIGH帯ガード用
 * 🆕 meta追加（2026-01-31）: 質問と軸の紐付け情報
 */
export interface MessageRule {
  /** ルールID */
  id: string;
  /** 優先度（高いほど優先） */
  priority: number;
  /** 条件 */
  conditions: Conditions;
  /** メッセージ */
  message: string;
  /** 有効/無効フラグ */
  enabled: boolean;
  /** 🆕 厳しさレベル（hard: 致命的, normal: 標準, soft: やさしい） */
  severity?: 'hard' | 'normal' | 'soft';
  /** 🆕 メタ情報（質問と軸の紐付け） */
  meta?: {
    /** 質問キー（Q1-Q12） */
    questionKey: `Q${QuestionId}`;
    /** 軸キー */
    axisKey: AxisKey;
  };
}

/**
 * メッセージルール定義
 */
export interface MessageRules {
  /** バージョン */
  version: string;
  /** タイプ別主メッセージ */
  mainMessages: Record<DiagnosisType, string>;
  /** ルールリスト */
  rules: MessageRule[];
}

// ----------------------------------------------------------------------------
// 結果ページ関連の型
// ----------------------------------------------------------------------------

/**
 * 次の一手
 */
export interface NextSteps {
  /** 今日やること */
  today: string;
  /** 今週やること */
  thisWeek: string;
  /** 今月やること */
  thisMonth: string;
}

/**
 * CTA（Call to Action）コンテンツ
 */
export interface CTAContent {
  /** タイトル */
  title: string;
  /** 説明 */
  description: string;
  /** ボタンテキスト（感情訴求ラベル） */
  buttonText: string;
  /** LP URL（UTMパラメータ付き） */
  lpUrl: string;
}

/**
 * 結果ページデータ
 */
export interface ResultPageData {
  /** 診断結果 */
  diagnosisResult: DiagnosisResult;
  /** カスタムメッセージ（1-2個） */
  customMessages: string[];
  /** 次の一手 */
  nextSteps: NextSteps;
  /** CTAコンテンツ */
  ctaContent: CTAContent;
}

/**
 * レーダーチャート用データポイント
 */
export interface RadarDataPoint {
  /** 軸名（表示用） */
  axis: string;
  /** スコア値（0-100） */
  value: number;
  /** 最大値（常に100） */
  fullMark: number;
}

/**
 * 4軸の詳細説明
 */
export interface AxisDetail {
  /** 軸キー */
  key: AxisKey;
  /** 軸名（日本語） */
  label: string;
  /** スコア値（0-100） */
  score: number;
  /** 説明文（カスタマイズされた文章） */
  description: string;
  /** 背景色（MUIカラー） */
  backgroundColor: string;
  /** テキストカラー（MUIカラー） */
  textColor: string;
  /** 重要度フラグ（最低スコアの軸にtrue） */
  isLowest: boolean;
}

/**
 * カスタムメッセージ（複数文のブロック）
 */
export interface CustomMessage {
  /** メッセージID */
  id: string;
  /** メッセージ本文 */
  content: string;
}

/**
 * 次の一手の各ステップ
 */
export interface NextStep {
  /** ステップのラベル */
  label: string;
  /** 絵文字 */
  emoji: string;
  /** 説明文 */
  description: string;
}

/**
 * 特典（Benefit）情報
 */
export interface BenefitInfo {
  /** 特典タイトル */
  title: string;
  /** 特典説明 */
  description: string;
  /** 受け取りボタンのテキスト */
  buttonText: string;
  /** UTAGE登録フォームURL（UTMパラメータ付き） */
  utageUrl: string;
}

/**
 * スクリーンショット推奨バナー情報
 */
export interface ScreenshotBannerInfo {
  /** 表示するテキスト */
  text: string;
  /** 絵文字 */
  emoji: string;
  /** 表示/非表示フラグ */
  visible: boolean;
}

// ----------------------------------------------------------------------------
// タイプ定義関連の型
// ----------------------------------------------------------------------------

/**
 * タイプメタデータ
 */
export interface TypeMetadata {
  /** タイプID */
  id: DiagnosisType;
  /** タイプ名 */
  name: string;
  /** 判定軸 */
  axis: AxisKey;
  /** 状態説明 */
  description: string;
  /** 次の一手 */
  nextSteps: NextSteps;
}

// ----------------------------------------------------------------------------
// GA4イベント関連の型
// ----------------------------------------------------------------------------

/**
 * GA4イベント名
 */
export type GA4EventName =
  | 'Diagnosis_Start'
  | 'Diagnosis_Complete'
  | 'Result_View'
  | 'CTA_View'
  | 'CTA_Click'
  | 'Benefit_Register'
  | 'LP_Click';

/**
 * GA4イベントパラメータ
 */
export interface GA4EventParams {
  /** タイプ */
  diagnosis_type?: DiagnosisType;
  /** スコア（0-100） */
  diagnosis_score?: number;
  /** タイムスタンプ（ISO8601） */
  timestamp: string;
}

// ----------------------------------------------------------------------------
// 型ガード・型安全性強化の型
// ----------------------------------------------------------------------------

/**
 * 回答値の型ガード
 * @param value - 検証する値
 * @returns 回答値として有効な場合はtrue
 */
export function isAnswerValue(value: unknown): value is AnswerValue {
  return typeof value === 'number' && [0, 3, 6, 8].includes(value);
}

/**
 * 質問IDの型ガード
 * @param id - 検証する値
 * @returns 質問IDとして有効な場合はtrue
 */
export function isQuestionId(id: unknown): id is QuestionId {
  return typeof id === 'number' && id >= 1 && id <= 12;
}

/**
 * 診断タイプの型ガード
 * 🆕 MIXタイプ対応（2026-01-30）
 * @param type - 検証する値
 * @returns 診断タイプとして有効な場合はtrue
 */
export function isDiagnosisType(type: unknown): type is DiagnosisType {
  return (
    typeof type === 'string' &&
    [
      'BEGINNER',
      'T1',
      'T2',
      'T3',
      'T4',
      'BALANCED',
      'T1T2-MIX',
      'T1T3-MIX',
      'T1T4-MIX',
      'T2T3-MIX',
      'T2T4-MIX',
      'T3T4-MIX',
    ].includes(type)
  );
}

/**
 * 軸キーの型ガード
 * @param key - 検証する値
 * @returns 軸キーとして有効な場合はtrue
 */
export function isAxisKey(key: unknown): key is AxisKey {
  return (
    typeof key === 'string' &&
    ['design', 'production', 'improvement', 'continuation'].includes(key)
  );
}

/**
 * 回答データの型ガード
 * @param obj - 検証する値
 * @returns Answerとして有効な場合はtrue
 */
export function isAnswer(obj: unknown): obj is Answer {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const answer = obj as Record<string, unknown>;
  return isQuestionId(answer.questionId) && isAnswerValue(answer.value);
}

/**
 * 診断セッションデータの型ガード
 * @param obj - 検証する値
 * @returns DiagnosisSessionとして有効な場合はtrue
 */
export function isDiagnosisSession(obj: unknown): obj is DiagnosisSession {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const session = obj as Record<string, unknown>;

  // answersの検証
  if (!Array.isArray(session.answers) || session.answers.length !== 12) {
    return false;
  }
  if (!session.answers.every(isAnswer)) {
    return false;
  }

  // computedScoresの検証
  if (typeof session.computedScores !== 'object' || session.computedScores === null) {
    return false;
  }
  const scores = session.computedScores as Record<string, unknown>;
  if (
    typeof scores.design !== 'number' ||
    typeof scores.production !== 'number' ||
    typeof scores.improvement !== 'number' ||
    typeof scores.continuation !== 'number'
  ) {
    return false;
  }

  // computedTypeとlowestAxisとtimestampの検証
  return (
    isDiagnosisType(session.computedType) &&
    isAxisKey(session.lowestAxis) &&
    typeof session.timestamp === 'number'
  );
}

/**
 * レーダーチャート用データポイントの型ガード
 * @param obj - 検証する値
 * @returns RadarDataPointとして有効な場合はtrue
 */
export function isRadarDataPoint(obj: unknown): obj is RadarDataPoint {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const point = obj as Record<string, unknown>;
  return (
    typeof point.axis === 'string' &&
    typeof point.value === 'number' &&
    typeof point.fullMark === 'number'
  );
}

/**
 * 4軸詳細説明の型ガード
 * @param obj - 検証する値
 * @returns AxisDetailとして有効な場合はtrue
 */
export function isAxisDetail(obj: unknown): obj is AxisDetail {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const detail = obj as Record<string, unknown>;
  return (
    isAxisKey(detail.key) &&
    typeof detail.label === 'string' &&
    typeof detail.score === 'number' &&
    typeof detail.description === 'string' &&
    typeof detail.backgroundColor === 'string' &&
    typeof detail.textColor === 'string' &&
    typeof detail.isLowest === 'boolean'
  );
}

/**
 * カスタムメッセージの型ガード
 * @param obj - 検証する値
 * @returns CustomMessageとして有効な場合はtrue
 */
export function isCustomMessage(obj: unknown): obj is CustomMessage {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const message = obj as Record<string, unknown>;
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string'
  );
}

/**
 * 次の一手のステップの型ガード
 * @param obj - 検証する値
 * @returns NextStepとして有効な場合はtrue
 */
export function isNextStep(obj: unknown): obj is NextStep {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const step = obj as Record<string, unknown>;
  return (
    typeof step.label === 'string' &&
    typeof step.emoji === 'string' &&
    typeof step.description === 'string'
  );
}

/**
 * 特典情報の型ガード
 * @param obj - 検証する値
 * @returns BenefitInfoとして有効な場合はtrue
 */
export function isBenefitInfo(obj: unknown): obj is BenefitInfo {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const benefit = obj as Record<string, unknown>;
  return (
    typeof benefit.title === 'string' &&
    typeof benefit.description === 'string' &&
    typeof benefit.buttonText === 'string' &&
    typeof benefit.utageUrl === 'string'
  );
}

/**
 * スクリーンショット推奨バナー情報の型ガード
 * @param obj - 検証する値
 * @returns ScreenshotBannerInfoとして有効な場合はtrue
 */
export function isScreenshotBannerInfo(obj: unknown): obj is ScreenshotBannerInfo {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const banner = obj as Record<string, unknown>;
  return (
    typeof banner.text === 'string' &&
    typeof banner.emoji === 'string' &&
    typeof banner.visible === 'boolean'
  );
}
