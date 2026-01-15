import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'

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
