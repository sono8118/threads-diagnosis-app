// ============================================================================
// ErrorBoundary.tsx - React Error Boundary
// ============================================================================
// 目的: Reactコンポーネントエラーを捕捉し、アプリ全体のクラッシュを防ぐ
// 参考: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
// ============================================================================

import { Component } from 'react';
import type { ReactNode } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Reactのレンダリングエラーを捕捉し、フォールバックUIを表示します。
 * Class Componentとして実装（Error Boundaryの要件）。
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * エラー発生時に状態を更新
   * @param error - 発生したエラー
   * @returns 新しい状態
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * エラー発生時にログを記録
   * @param error - 発生したエラー
   * @param errorInfo - エラー情報（コンポーネントスタック）
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // エラーログを記録（本番環境ではSentry等に送信推奨）
    console.error('[Error Boundary] Component error caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // 将来的な拡張: Sentryへエラー送信
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    // }
  }

  /**
   * エラー状態をリセットしてアプリを再起動
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
    // 診断トップページにリダイレクト
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // フォールバックUI: エラー発生時に表示
      return (
        <Container maxWidth="sm">
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              py: 4,
            }}
          >
            {/* エラーアイコン */}
            <ErrorOutlineIcon
              sx={{
                fontSize: 80,
                color: 'error.main',
                mb: 3,
              }}
            />

            {/* エラーメッセージ */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              エラーが発生しました
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
              申し訳ございません。診断アプリで予期しないエラーが発生しました。
              <br />
              下のボタンをクリックして、診断をやり直してください。
            </Typography>

            {/* 開発環境のみ: エラー詳細表示 */}
            {import.meta.env.DEV && this.state.error && (
              <Box
                sx={{
                  mb: 4,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  textAlign: 'left',
                  maxWidth: '100%',
                  overflow: 'auto',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {this.state.error.message}
                </Typography>
              </Box>
            )}

            {/* 診断をやり直すボタン */}
            <Button
              variant="contained"
              size="large"
              onClick={this.handleReset}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
              }}
            >
              診断をやり直す
            </Button>
          </Box>
        </Container>
      );
    }

    // エラーがない場合は子コンポーネントを表示
    return this.props.children;
  }
}
