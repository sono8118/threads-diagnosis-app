// ============================================================================
// GA4イベント送信フック
// ============================================================================

import { useCallback } from 'react';
import type { GA4EventName, GA4EventParams } from '../types';

/**
 * GA4イベント送信フック
 */
export const useGA4 = () => {
  const sendEvent = useCallback((eventName: GA4EventName, params: GA4EventParams) => {
    // GTM経由でGA4にイベント送信
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  }, []);

  return { sendEvent };
};

// dataLayer型定義の拡張
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
