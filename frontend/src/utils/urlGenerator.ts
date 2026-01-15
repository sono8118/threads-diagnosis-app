// ============================================================================
// URL生成ユーティリティ - UTMパラメータ付きURL生成
// ============================================================================

import type { DiagnosisType } from '../types';

/**
 * UTMパラメータ
 */
interface UTMParams extends Record<string, string> {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

/**
 * UTMパラメータを生成
 * @param diagnosisType 診断タイプ（T1/T2/T3/T4/BEGINNER/BALANCED）
 * @param diagnosisScore 診断スコア（0-100）
 * @returns UTMパラメータ
 */
function generateUTMParams(diagnosisType: DiagnosisType, diagnosisScore: number): UTMParams {
  return {
    utm_source: 'diagnosis',
    utm_medium: 'app',
    utm_campaign: 'threads_manager',
    utm_content: diagnosisType,
    utm_term: `score_${diagnosisScore}`,
  };
}

/**
 * URLにクエリパラメータを追加
 * @param baseUrl ベースURL
 * @param params クエリパラメータ
 * @returns パラメータ付きURL
 */
function appendQueryParams(baseUrl: string, params: Record<string, string>): string {
  const url = new URL(baseUrl);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
}

/**
 * LP（商品ページ）のURLを生成
 * @param diagnosisType 診断タイプ
 * @param diagnosisScore 診断スコア
 * @returns UTMパラメータ付きLP URL
 */
export function generateLPUrl(diagnosisType: DiagnosisType, diagnosisScore: number): string {
  const baseUrl = import.meta.env.VITE_LP_URL;

  if (!baseUrl) {
    console.error('[urlGenerator] VITE_LP_URL が設定されていません');
    return '';
  }

  const utmParams = generateUTMParams(diagnosisType, diagnosisScore);
  return appendQueryParams(baseUrl, utmParams);
}

/**
 * UTAGE登録フォームのURLを生成
 * @param diagnosisType 診断タイプ
 * @param diagnosisScore 診断スコア
 * @returns UTMパラメータ付きUTAGE URL
 */
export function generateUTAGEUrl(diagnosisType: DiagnosisType, diagnosisScore: number): string {
  const baseUrl = import.meta.env.VITE_UTAGE_BASE_URL;

  if (!baseUrl) {
    console.error('[urlGenerator] VITE_UTAGE_BASE_URL が設定されていません');
    return '';
  }

  const utmParams = generateUTMParams(diagnosisType, diagnosisScore);
  return appendQueryParams(baseUrl, utmParams);
}
