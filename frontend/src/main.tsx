import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'

// ============================================================================
// Google Tag Manager (GTM) 初期化
// ============================================================================
// 目的: GA4計測の有効化
// 参考: https://support.google.com/tagmanager/answer/6103696
// ============================================================================

const initializeGTM = () => {
  const gtmId = import.meta.env.VITE_GTM_ID;

  if (!gtmId) {
    console.warn('[GTM] VITE_GTM_ID environment variable is not set');
    return;
  }

  // dataLayerの初期化
  window.dataLayer = window.dataLayer || [];

  // GTM初期化イベント
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // GTMスクリプトの動的読み込み
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(script);
};

// GTMを初期化
initializeGTM();

// ============================================================================
// Unhandled Promise Rejection対策
// ============================================================================
// 目的: Promise拒否を捕捉し、アプリのクラッシュを防ぐ
// 参考: https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event
// ============================================================================

window.addEventListener('unhandledrejection', (event) => {
  // エラーログを記録（本番環境ではSentry等に送信推奨）
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
  });

  // 将来的な拡張: Sentryへエラー送信
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(event.reason);
  // }

  // エラー伝播を防ぐ（ブラウザのデフォルトエラー処理を抑制）
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
