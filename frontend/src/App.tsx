// ============================================================================
// App.tsx - ルーティング設定
// ============================================================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DiagnosisPage from './pages/DiagnosisPage';
import ResultPage from './pages/ResultPage';

// シンプルなデフォルトテーマ（Phase 6で本格的なテーマに置き換え予定）
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DiagnosisPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
