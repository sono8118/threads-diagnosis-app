// ============================================================================
// sessionStorage管理 - 診断セッションデータの保存・取得
// ============================================================================

import type { DiagnosisSession } from '../types';

// sessionStorageのキー名
const SESSION_KEY = 'threads_diagnosis_session';

/**
 * 診断セッションデータを保存
 * @param session 診断セッションデータ
 */
export function saveDiagnosisSession(session: DiagnosisSession): void {
  try {
    const json = JSON.stringify(session);
    sessionStorage.setItem(SESSION_KEY, json);
  } catch (error) {
    console.error('[sessionStorage] 保存エラー:', error);
    throw new Error('診断データの保存に失敗しました');
  }
}

/**
 * 診断セッションデータを取得
 * @returns 診断セッションデータ（存在しない場合はnull）
 */
export function loadDiagnosisSession(): DiagnosisSession | null {
  try {
    const json = sessionStorage.getItem(SESSION_KEY);
    if (!json) {
      return null;
    }

    const session = JSON.parse(json) as DiagnosisSession;
    return session;
  } catch (error) {
    console.error('[sessionStorage] 取得エラー:', error);
    return null;
  }
}

/**
 * 診断セッションデータを削除
 */
export function clearDiagnosisSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('[sessionStorage] 削除エラー:', error);
  }
}

/**
 * 診断セッションデータが存在するか確認
 * @returns 存在する場合true
 */
export function hasDiagnosisSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) !== null;
}
