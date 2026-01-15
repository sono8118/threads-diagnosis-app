import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import { PublicLayout } from '@/layouts/PublicLayout';
import { RadarChartComponent } from '@/components/result/RadarChartComponent';
import {
  TYPE_METADATA,
  AXIS_DESCRIPTIONS,
  BEGINNER_AXIS_DESCRIPTIONS,
  BALANCED_AXIS_DESCRIPTIONS,
} from '@/constants/TYPES';
import { generateLPUrl } from '@/utils/urlGenerator';
import { useGA4 } from '@/hooks/useGA4';
import type { AxisKey, DiagnosisSession } from '@/types';

/**
 * 結果ページコンポーネント
 * - sessionStorageから診断データを取得
 * - データがない場合は診断トップへリダイレクト
 */
export const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const { sendEvent } = useGA4();

  // sessionStorageから診断データを取得
  const sessionData = sessionStorage.getItem('threads_diagnosis_session');

  useEffect(() => {
    // データがない場合は診断トップへリダイレクト
    if (!sessionData) {
      navigate('/');
      return;
    }

    // 結果ページ表示時にGA4イベント送信
    const data: DiagnosisSession = JSON.parse(sessionData);
    const totalScoreValue = Math.round(
      (data.computedScores.design +
        data.computedScores.production +
        data.computedScores.improvement +
        data.computedScores.business) /
        4
    );

    // 結果ページ表示イベント
    sendEvent('Result_View', {
      diagnosis_type: data.computedType,
      diagnosis_score: totalScoreValue,
      timestamp: new Date().toISOString(),
    });

    // CTA表示イベント（インプレッション計測）
    sendEvent('CTA_View', {
      diagnosis_type: data.computedType,
      diagnosis_score: totalScoreValue,
      timestamp: new Date().toISOString(),
    });
  }, [sessionData, navigate, sendEvent]);

  // sessionDataがない場合は何も表示しない（リダイレクト中）
  if (!sessionData) {
    return null;
  }

  // sessionDataをパース
  const data: DiagnosisSession = JSON.parse(sessionData);
  const { computedScores, computedType, customMessages } = data;

  // タイプメタデータを取得
  const typeMetadata = TYPE_METADATA[computedType];

  // 総合スコアを計算（平均）
  const totalScore = Math.round(
    (computedScores.design +
      computedScores.production +
      computedScores.improvement +
      computedScores.business) /
      4
  );

  // 最低スコアの軸を特定
  const lowestAxis: AxisKey = (
    Object.entries(computedScores) as [AxisKey, number][]
  ).reduce((min, [key, value]) => (value < computedScores[min] ? key : min), 'design' as AxisKey);

  // 軸詳細データを作成（動的生成、タイプ別に使用する説明を切り替え）
  const axisDetails = (Object.keys(AXIS_DESCRIPTIONS) as AxisKey[]).map((axisKey) => {
    let axisDescription: string;
    let isLowest = false;
    const score = computedScores[axisKey];

    if (computedType === 'BEGINNER') {
      // BEGINNER: 全軸に専用説明を使用
      axisDescription = BEGINNER_AXIS_DESCRIPTIONS[axisKey].description;
    } else if (computedType === 'BALANCED') {
      // BALANCED: 全軸に専用説明を使用
      axisDescription = BALANCED_AXIS_DESCRIPTIONS[axisKey].description;
    } else {
      // T1-T4: スコアと最低軸に応じて説明を切り替え
      isLowest = lowestAxis === axisKey;
      const axisData = AXIS_DESCRIPTIONS[axisKey];

      if (isLowest) {
        // 最低軸: lowestDescriptionを使用
        axisDescription = axisData.lowestDescription;
      } else if (score < 70) {
        // 最低軸以外で70点未満: lowScoreDescriptionを使用
        axisDescription = axisData.lowScoreDescription;
      } else {
        // 最低軸以外で70点以上: 通常のdescriptionを使用
        axisDescription = axisData.description;
      }
    }

    return {
      key: axisKey,
      label: AXIS_DESCRIPTIONS[axisKey].label,
      score: computedScores[axisKey],
      description: axisDescription,
      isLowest,
    };
  });

  // 次の一手（タイプ別に動的生成）
  const nextSteps = [
    {
      emoji: '🟢',
      label: 'まずできそうなこと',
      description: typeMetadata.nextSteps.today,
    },
    {
      emoji: '🔵',
      label: '少し慣れたら',
      description: typeMetadata.nextSteps.thisWeek,
    },
    {
      emoji: '🟣',
      label: '余裕が出てきたら',
      description: typeMetadata.nextSteps.thisMonth,
    },
  ];

  const handleCTAClick = () => {
    // LP遷移（UTMパラメータ付き）
    const lpUrl = generateLPUrl(computedType, totalScore);
    if (lpUrl) {
      // GA4イベント送信
      sendEvent('CTA_Click', {
        diagnosis_type: computedType,
        diagnosis_score: totalScore,
        timestamp: new Date().toISOString(),
      });
      window.open(lpUrl, '_blank');
    } else {
      console.error('[ResultPage] LP URLの生成に失敗しました');
    }
  };

  // 特典登録ハンドラー（一時的に非表示のため使用していない）
  // const handleBenefitClick = () => {
  //   const utageUrl = generateUTAGEUrl(computedType, totalScore);
  //   if (utageUrl) {
  //     sendEvent('Benefit_Register', {
  //       diagnosis_type: computedType,
  //       diagnosis_score: totalScore,
  //       timestamp: new Date().toISOString(),
  //     });
  //     window.open(utageUrl, '_blank');
  //   } else {
  //     console.error('[ResultPage] UTAGE URLの生成に失敗しました');
  //   }
  // };

  return (
    <PublicLayout>
      {/* MUI: Container maxWidth="md" p={3} */}
      <Container maxWidth="md" sx={{ p: 3 }}>
        {/* スクショ推奨案内 */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={2.5} mb={4} sx={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 2.5,
            mb: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #f5f5f5',
          }}
        >
          {/* MUI: Typography variant="body2" color="text.secondary" textAlign="center" */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ fontSize: 15 }}
          >
            📸 診断結果はこのページだけで表示されます。スクリーンショットで保存しておくと便利です。
          </Typography>
        </Paper>

        {/* タイプ判定（表紙として表示） */}
        {/* MUI: Box pt={7.5} pb={6} px={4} mb={6} textAlign="center" */}
        <Box
          sx={{
            pt: 7.5,
            pb: 6,
            px: 4,
            mb: 6,
            textAlign: 'center',
          }}
        >
          {/* MUI: Typography variant="h3" mb={2} fontWeight={500} */}
          <Typography
            variant="h3"
            sx={{
              mb: 2,
              fontWeight: 500,
              fontSize: 32,
              color: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            {typeMetadata.name}
          </Typography>

          {/* アクセント線 */}
          {/* MUI: Box width={80} height={2} bgcolor="#5a9fd4" mx="auto" my={2} */}
          <Box
            sx={{
              width: 80,
              height: 2,
              bgcolor: '#5a9fd4',
              mx: 'auto',
              my: 2,
            }}
          />

          {/* MUI: Typography variant="body1" color="text.secondary" mb={2} lineHeight={2.2} fontSize={18} maxWidth={600} mx="auto" */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 2.2,
              fontSize: 18,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {typeMetadata.description}
          </Typography>

          {/* MUI: Typography fontSize={15} color="#5a6a7a" mt={2} mb={5} maxWidth={600} mx="auto" */}
          <Typography
            sx={{
              fontSize: 15,
              color: '#5a6a7a',
              mt: 2,
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {typeMetadata.subText}
          </Typography>

          {/* 100点満点スコア（BEGINNERは特別表示） */}
          {/* MUI: Box mb={0} */}
          <Box sx={{ mb: 0 }}>
            {/* MUI: Typography variant="caption" color="text.disabled" opacity={0.8} */}
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                fontSize: 13,
                opacity: 0.8,
              }}
            >
              {computedType === 'BEGINNER'
                ? '現在地：スタート地点'
                : `総合スコア：${totalScore} / 100`}
            </Typography>
          </Box>
        </Box>

        {/* 4軸レーダーチャート */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={5,4} mb={4} sx={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 4, sm: 5 },
            mb: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #f5f5f5',
          }}
        >
          {/* MUI: Typography variant="h5" mb={4} textAlign="center" fontWeight={400} */}
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              textAlign: 'center',
              fontWeight: 400,
              fontSize: 20,
              color: 'rgba(0, 0, 0, 0.75)',
            }}
          >
            あなたの4軸スコア
          </Typography>

          {/* レーダーチャート */}
          {/* MUI: Box width="100%" height={450/300} display="flex" alignItems="center" justifyContent="center" mb={4} */}
          <Box
            sx={{
              width: '100%',
              height: { xs: 300, sm: 450 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              '& *': {
                outline: 'none !important',
              },
              '& *:focus': {
                outline: 'none !important',
              },
              '& svg': {
                outline: 'none !important',
              },
              pointerEvents: 'none',
            }}
          >
            <RadarChartComponent scores={computedScores} lowestAxis={lowestAxis} />
          </Box>

          {/* 4軸スコア詳細 */}
          {/* MUI: Grid container spacing={3} */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
            {axisDetails.map((axis) => (
              <Box
                key={axis.key}
                sx={{
                  p: 2.5,
                  bgcolor: axis.isLowest ? '#fff5ed' : '#f0f6fa',
                  borderRadius: 4,
                }}
              >
                {/* MUI: Typography variant="body2" fontWeight={500} color="#5a9fd4" mb={1} */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: axis.isLowest ? '#b87850' : '#5a9fd4',
                    mb: 1,
                    fontSize: 15,
                  }}
                >
                  {axis.label}
                </Typography>
                {/* MUI: Typography variant="body1" color="text.primary" lineHeight={2.0} fontSize={17} */}
                <Typography
                  variant="body1"
                  sx={{
                    color: axis.isLowest ? '#b87850' : 'rgba(0, 0, 0, 0.75)',
                    lineHeight: 2.0,
                    fontSize: 17,
                  }}
                >
                  {axis.description}
                  <Box
                    component="span"
                    sx={{ color: 'rgba(0, 0, 0, 0.4)', fontSize: 15, ml: 0.5 }}
                  >
                    （{axis.score}）
                  </Box>
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* カスタムメッセージ */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={5,4} mb={4} sx={{background: '#f8fbfd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 4, sm: 5 },
            mb: 4,
            background: '#f8fbfd',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #e8f2f8',
          }}
        >
          {/* MUI: Typography variant="h5" mb={4} fontWeight={400} */}
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 400,
              fontSize: 20,
              color: 'rgba(0, 0, 0, 0.75)',
            }}
          >
            🔍 今のあなたの状態を、言葉にすると
          </Typography>

          {/* 文章ブロック形式 */}
          {customMessages.map((message, index) => (
            /* MUI: Box pl={2.5} borderLeft="3px solid #b8d4e8" mb={3.5} */
            <Box
              key={index}
              sx={{
                pl: 2.5,
                borderLeft: '3px solid #b8d4e8',
                mb: index < customMessages.length - 1 ? 3.5 : 0,
              }}
            >
              {/* MUI: Typography variant="body1" lineHeight={2.0} fontSize={17} color="text.primary" */}
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 2.0,
                  fontSize: 17,
                  color: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                {message}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* 次の一手 */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={5,4} mb={4} sx={{boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 4, sm: 5 },
            mb: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid #f5f5f5',
          }}
        >
          {/* MUI: Typography variant="h5" mb={2} fontWeight={400} */}
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: 400,
              fontSize: 20,
              color: 'rgba(0, 0, 0, 0.75)',
            }}
          >
            🚶‍♀️ これからの一歩
          </Typography>

          {/* MUI: Typography fontSize={16} color="#5a6a7a" fontWeight={500} mb={4} */}
          <Typography
            sx={{
              fontSize: 16,
              color: '#5a6a7a',
              fontWeight: 500,
              mb: 4,
            }}
          >
            いきなり全部変えなくて大丈夫です。
          </Typography>

          {/* まずできそうなこと・少し慣れたら・余裕が出てきたら */}
          {nextSteps.map((step, index) => (
            /* MUI: Box mb={4} */
            <Box key={index} sx={{ mb: index < nextSteps.length - 1 ? 4 : 0 }}>
              {/* MUI: Typography variant="h6" fontWeight={500} color="text.secondary" mb={1.5} */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: 'rgba(0, 0, 0, 0.6)',
                  mb: 1.5,
                  fontSize: 16,
                }}
              >
                {step.emoji} {step.label}
              </Typography>
              {/* MUI: Typography variant="body1" lineHeight={2.0} fontSize={17} color="text.primary" */}
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 2.0,
                  fontSize: 17,
                  color: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                {step.description}
              </Typography>
            </Box>
          ))}
        </Paper>

        {/* 商品提案CTA（タイプ別出し分け + デザイン強化） */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 5,
            mb: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f8fbff 0%, #f0f6fa 100%)',
            border: '2px solid #b8d4e8',
            boxShadow: '0 4px 16px rgba(90, 159, 212, 0.15)',
          }}
        >
          {/* 絵文字単体 */}
          <Box sx={{ textAlign: 'center', mb: 2.5 }}>
            <Box component="span" sx={{ fontSize: 40 }}>
              ✨
            </Box>
          </Box>

          {/* タイトル（タイプ別） */}
          <Typography
            variant="h5"
            sx={{
              fontSize: 21,
              mb: 3,
              fontWeight: 600,
              color: 'rgba(0, 0, 0, 0.85)',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            {typeMetadata.cta.title}
          </Typography>

          {/* 説明文（タイプ別、改行対応） */}
          <Typography
            sx={{
              fontSize: 16,
              color: 'rgba(0, 0, 0, 0.7)',
              mb: 4,
              lineHeight: 2.0,
              maxWidth: 600,
              mx: 'auto',
              whiteSpace: 'pre-line',
            }}
          >
            {typeMetadata.cta.description}
          </Typography>

          {/* CTAボタン（塗りつぶし型 + ホバー強化） */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCTAClick}
            sx={{
              maxWidth: 400,
              mb: 2,
              bgcolor: '#5a9fd4',
              color: '#ffffff',
              boxShadow: '0 3px 12px rgba(90, 159, 212, 0.25)',
              borderRadius: 3,
              fontSize: 17,
              fontWeight: 500,
              textTransform: 'none',
              py: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#6aaee0',
                boxShadow: '0 5px 16px rgba(90, 159, 212, 0.35)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            {typeMetadata.cta.buttonText}
          </Button>
        </Paper>

        {/* 特典登録ブロック - 一時的に非表示 */}
        {/*
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 4,
            mb: 4,
            textAlign: 'center',
            background: '#fff8f4',
            border: '1px solid #f0dbc8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontSize: 19,
              mb: 2.5,
              fontWeight: 400,
              color: 'rgba(0, 0, 0, 0.65)',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            🎁 無料特典を受け取る
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              lineHeight: 2.0,
              fontSize: 17,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            <Box component="strong" sx={{ color: 'rgba(0, 0, 0, 0.75)' }}>
              Threads運用 7日間リセット設計シート
            </Box>
            <br />
            （PDF + Googleスプレッドシート）
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            onClick={handleBenefitClick}
            sx={{
              maxWidth: 400,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 3,
              fontSize: 16,
              fontWeight: 400,
              textTransform: 'none',
              py: 1.75,
              ...buttonHoverBenefitStyle,
            }}
          >
            特典を受け取る
          </Button>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              mt: 2,
              fontSize: 13,
              maxWidth: 600,
              mx: 'auto',
              display: 'block',
            }}
          >
            ※ 登録フォームに移動します（別タブ）
          </Typography>
        </Paper>
        */}
      </Container>
    </PublicLayout>
  );
};

export default ResultPage;
