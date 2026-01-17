// ============================================================================
// P-001: 診断ページ - Threads運用診断
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Stack,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDiagnosisStore } from '../stores/diagnosisStore';
import { QUESTIONS } from '../constants/QUESTIONS';
import { calculateDiagnosis } from '../logic/diagnosisLogic';
import { generateCustomMessages } from '../logic/messageEngine';
import { saveDiagnosisSession } from '../utils/sessionStorage';
import { useGA4 } from '../hooks/useGA4';
import { Footer } from '../components/common/Footer';
import type { DiagnosisSession } from '../types';

/**
 * 診断ページの画面状態
 */
type ScreenState = 'start' | 'question' | 'complete';

/**
 * P-001: 診断ページ
 */
export const DiagnosisPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendEvent } = useGA4();

  // Zustand状態
  const {
    currentQuestionIndex,
    answers,
    hasConsented,
    setConsent,
    setAnswer,
    nextQuestion,
    previousQuestion,
  } = useDiagnosisStore();

  // ローカル状態
  const [screenState, setScreenState] = useState<ScreenState>('start');
  const [isConsentAlertOpen, setIsConsentAlertOpen] = useState<boolean>(false);

  // setTimeout競合防止用フラグ（複数回のhandleViewResult呼び出しを防ぐ）
  const isTransitioningRef = useRef<boolean>(false);

  // 全画面背景グラデーションを設定（マウント時）
  useEffect(() => {
    // body要素に背景グラデーションを適用
    document.body.style.background = 'linear-gradient(180deg, #f8f9fa 0%, #e8f4f8 100%)';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // クリーンアップ（アンマウント時に背景色をリセット）
    return () => {
      document.body.style.background = '';
      document.body.style.minHeight = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
    };
  }, []);

  // 現在の質問
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUESTIONS.length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
  const remainingQuestions = totalQuestions - (currentQuestionIndex + 1);

  // 選択値の状態（ローカルUI状態として管理）
  // 質問が変わったときに既存の回答を表示、その後はユーザー操作で更新
  const [selectedValue, setSelectedValue] = useState<number | null>(null);

  // answersの最新値を参照用に保持（useEffect内で使用）
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // 質問が変わったときのみ選択値を更新
  // answersをrefで参照することで、質問ID変更時のみ更新される
  const currentQuestionId = currentQuestion?.id;
  useEffect(() => {
    const answer = answersRef.current.find((a) => a.questionId === currentQuestionId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedValue(answer?.value ?? null);
  }, [currentQuestionId]);

  // ========== 画面1: 診断開始画面のハンドラー ==========

  /**
   * 同意チェックボックスの切り替え
   */
  const handleConsentChange = () => {
    setConsent(!hasConsented);
  };

  /**
   * 診断開始ボタンクリック
   */
  const handleStartDiagnosis = () => {
    if (!hasConsented) {
      setIsConsentAlertOpen(true);
      return;
    }

    // GA4イベント送信
    sendEvent('Diagnosis_Start', {
      diagnosis_type: 'T1', // 開始時点では不明
      diagnosis_score: 0,
      timestamp: new Date().toISOString(),
    });

    setScreenState('question');
  };

  // ========== 画面2: 質問画面のハンドラー ==========

  /**
   * 選択肢クリック
   */
  const handleChoiceClick = (value: number) => {
    setSelectedValue(value);
    setAnswer(currentQuestion.id, value);
  };

  /**
   * 次へボタンクリック
   */
  const handleNextQuestion = () => {
    if (selectedValue === null) {
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      // 次の質問へ
      nextQuestion();
      setSelectedValue(null);
    } else {
      // 全問回答完了 → 診断完了画面へ

      // 既に遷移処理中の場合は無視（連続クリック防止）
      if (isTransitioningRef.current) {
        return;
      }

      isTransitioningRef.current = true;
      setScreenState('complete');

      // 診断結果を計算
      const result = calculateDiagnosis(answers);

      // GA4イベント送信
      sendEvent('Diagnosis_Complete', {
        diagnosis_type: result.diagnosisType,
        diagnosis_score: result.totalScore,
        timestamp: new Date().toISOString(),
      });

      // 1.5秒後に自動遷移（処理中フラグにより1回のみ実行）
      setTimeout(() => {
        handleViewResult();
        // 遷移完了後はフラグリセット不要（ページ遷移で破棄される）
      }, 1500);
    }
  };

  /**
   * 戻るボタンクリック
   */
  const handlePreviousQuestion = () => {
    previousQuestion();
  };

  /**
   * 同意確認ダイアログを閉じる
   */
  const handleCloseConsentAlert = () => {
    setIsConsentAlertOpen(false);
  };

  // ========== 画面3: 完了画面のハンドラー ==========

  /**
   * 結果を見るボタンクリック
   */
  const handleViewResult = () => {
    // 診断結果を計算
    const result = calculateDiagnosis(answers);

    // カスタムメッセージを生成
    const customMessages = generateCustomMessages(result, answers);

    // sessionStorageに保存
    const session: DiagnosisSession = {
      answers,
      computedScores: result.normalizedScores,
      computedType: result.diagnosisType,
      customMessages,
      timestamp: Date.now(),
    };
    saveDiagnosisSession(session);

    // 結果ページへ遷移
    navigate('/result');
  };

  // ========== レンダリング ==========

  return (
    <>
      {/* ========== 画面1: 診断開始画面 ========== */}
      {screenState === 'start' && (
        <Container maxWidth={false} sx={{ maxWidth: '600px', margin: '0 auto', p: 2, py: 4 }}>
          {/* タイトルセクション */}
          <Box textAlign="center" mb={5}>
            <Typography variant="h4" mb={2} sx={{ color: '#2c3e50' }}>
              Threads運用診断
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#546e7a' }}
            >
              12問（2〜3分）で、「Threadsしんどい理由」がやさしく見えてきます
            </Typography>
          </Box>

          {/* 診断でわかることカード */}
          <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
            <Typography variant="h6" mb={2} sx={{ color: '#2c3e50' }}>
              診断でわかること
            </Typography>
            <Box pl={3}>
              <Typography variant="body1" component="li" mb={1}>
                今のあなたのThreadsの状態
              </Typography>
              <Typography variant="body1" component="li" mb={1}>
                うまく進まない理由
              </Typography>
              <Typography variant="body1" component="li">
                これから楽になる一歩
              </Typography>
            </Box>
          </Paper>

          {/* 同意チェックボックスカード */}
          <Paper
            onClick={handleConsentChange}
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: 3,
              cursor: 'pointer',
              border: hasConsented ? '1px solid rgba(107, 123, 140, 0.2)' : '1px solid #E0E4E8',
              background: hasConsented ? '#F7FAFD' : '#ffffff',
              boxShadow: hasConsented
                ? '0px 2px 6px rgba(0, 0, 0, 0.05)'
                : '0px 2px 4px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: hasConsented ? '#F7FAFD' : '#F4F7FA',
              },
            }}
          >
            <Box display="flex" alignItems="center">
              <Checkbox
                checked={hasConsented}
                size="small"
                sx={{
                  mr: 1.5,
                  color: '#D0D7DE',
                  '&.Mui-checked': {
                    color: '#6B7B8C',
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: hasConsented ? 'rgba(0, 0, 0, 0.90)' : 'rgba(0, 0, 0, 0.87)',
                  transition: 'all 0.2s ease',
                }}
              >
                診断結果に合ったアドバイスを受け取ります
              </Typography>
            </Box>
          </Paper>

          {/* 診断を始めるボタン */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleStartDiagnosis}
            sx={{
              borderRadius: 3,
              py: 2,
              fontSize: '1.0625rem',
              fontWeight: 500,
              textTransform: 'none',
              letterSpacing: '0.01em',
              background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
              boxShadow: '0px 6px 20px rgba(25, 118, 210, 0.3)',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 8px 24px rgba(25, 118, 210, 0.4)',
              },
            }}
          >
            診断を始める
          </Button>

          <Footer />
        </Container>
      )}

      {/* ========== 画面2: 質問画面 ========== */}
      {screenState === 'question' && currentQuestion && (
        <Container maxWidth={false} sx={{ maxWidth: '600px', margin: '0 auto', p: 2, py: 4 }}>
          {/* プログレスバー */}
          <Box mb={4}>
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Typography variant="body2" fontWeight="medium" color="text.secondary">
                質問 {currentQuestionIndex + 1} / {totalQuestions}
              </Typography>
              <Typography variant="body2" fontWeight="medium" color="primary.main">
                あと{remainingQuestions}問
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 10,
                borderRadius: 2,
                backgroundColor: '#e3f2fd',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
                },
              }}
            />
          </Box>

          {/* 質問カード */}
          <Paper sx={{ p: 4, mb: 4, borderRadius: 4 }}>
            <Typography variant="h5" mb={4} sx={{ color: '#2c3e50' }}>
              Q{currentQuestion.id}. {currentQuestion.question}
              {currentQuestion.subText && (
                <>
                  <br />
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.875rem', color: '#7986cb', fontWeight: 400 }}
                  >
                    {currentQuestion.subText}
                  </Typography>
                </>
              )}
            </Typography>

            {/* 4択（2×2グリッド配置） */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
              }}
            >
              {currentQuestion.options.map((option) => (
                <Paper
                  key={option.value}
                  onClick={() => handleChoiceClick(option.value)}
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 3,
                    minHeight: 100,
                    borderRadius: 3,
                    cursor: 'pointer',
                    background: selectedValue === option.value ? '#E3F2FD' : '#F5F7FA',
                    border:
                      selectedValue === option.value
                        ? '2px solid #1976d2'
                        : '2px solid #E0E4E8',
                    boxShadow:
                      selectedValue === option.value
                        ? '0px 4px 12px rgba(25, 118, 210, 0.2)'
                        : '0px 2px 4px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: '#5BA8E0',
                      background: '#E3F2FD',
                      transform: 'translateY(-2px)',
                      boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.12)',
                    },
                    // 選択中のチェックアイコン
                    '&::before':
                      selectedValue === option.value
                        ? {
                            content: '"✓"',
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 20,
                            height: 20,
                            background: '#1976d2',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0px 2px 4px rgba(25, 118, 210, 0.3)',
                          }
                        : undefined,
                  }}
                >
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    sx={{
                      color: selectedValue === option.value ? '#1565c0' : '#2c3e50',
                      fontWeight: selectedValue === option.value ? 600 : 500,
                      lineHeight: 1.6,
                      textAlign: 'center',
                    }}
                  >
                    {option.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>

          {/* ナビゲーションボタン */}
          <Stack direction="row" spacing={2}>
            {currentQuestionIndex > 0 && (
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                onClick={handlePreviousQuestion}
                sx={{
                  borderRadius: 2.5,
                  py: 1.75,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  letterSpacing: '0.01em',
                  background: 'white',
                  border: '2px solid #e3f2fd',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#90caf9',
                    background: '#f3f9ff',
                  },
                }}
              >
                戻る
              </Button>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNextQuestion}
              disabled={selectedValue === null}
              sx={{
                borderRadius: 2.5,
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                letterSpacing: '0.01em',
                background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
                boxShadow: '0px 4px 12px rgba(25, 118, 210, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0px 6px 16px rgba(25, 118, 210, 0.4)',
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                  color: 'rgba(0, 0, 0, 0.38)',
                  boxShadow: 'none',
                },
              }}
            >
              次へ
            </Button>
          </Stack>

          <Footer />
        </Container>
      )}

      {/* ========== 画面3: 完了画面 ========== */}
      {screenState === 'complete' && (
        <Container
          maxWidth={false}
          sx={{
            maxWidth: '600px',
            margin: '0 auto',
            p: 2,
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <Box textAlign="center">
            {/* やさしい雰囲気のイラスト（ドキュメントアイコン） */}
            <Box sx={{ fontSize: '80px', mb: 3, opacity: 0.9 }}>📋</Box>

            <Typography
              variant="h4"
              mb={2}
              sx={{ fontSize: '1.75rem', fontWeight: 400, color: '#2c3e50' }}
            >
              おつかれさまでした！
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#546e7a', mb: 4 }}
            >
              あなたの診断結果をまとめています...
            </Typography>

            {/* ロードアニメーション（3つの点が順番に表示） */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              {[0, 0.2, 0.4].map((delay, index) => (
                <Box
                  key={index}
                  sx={{
                    width: 12,
                    height: 12,
                    background: '#1976d2',
                    borderRadius: '50%',
                    animation: `pulse 1.4s infinite ease-in-out ${delay}s`,
                    '@keyframes pulse': {
                      '0%, 80%, 100%': {
                        opacity: 0.3,
                        transform: 'scale(0.8)',
                      },
                      '40%': {
                        opacity: 1,
                        transform: 'scale(1.2)',
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          <Footer />
        </Container>
      )}

      {/* 同意確認ダイアログ */}
      <Dialog
        open={isConsentAlertOpen}
        onClose={handleCloseConsentAlert}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#2c3e50',
            pb: 1,
          }}
        >
          同意確認
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: '1rem',
              color: '#546e7a',
              lineHeight: 1.6,
            }}
          >
            診断結果に合ったアドバイスを受け取ることに同意してください
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseConsentAlert}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DiagnosisPage;
