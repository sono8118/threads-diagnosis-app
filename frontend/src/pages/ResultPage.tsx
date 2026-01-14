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
import type { AxisKey, DiagnosisSession } from '@/types';

/**
 * 結果ページコンポーネント
 * - sessionStorageから診断データを取得
 * - データがない場合は診断トップへリダイレクト
 */
export const ResultPage: React.FC = () => {
  const navigate = useNavigate();

  // sessionStorageから診断データを取得
  const sessionData = sessionStorage.getItem('threads_diagnosis_session');

  useEffect(() => {
    // データがない場合は診断トップへリダイレクト
    if (!sessionData) {
      navigate('/');
    }
  }, [sessionData, navigate]);

  // sessionDataがない場合は何も表示しない（リダイレクト中）
  if (!sessionData) {
    return null;
  }

  // sessionDataをパース
  const data: DiagnosisSession = JSON.parse(sessionData);
  const { computedScores, computedType } = data;

  // タイプ名のマッピング
  const typeNames: Record<string, string> = {
    T1: '迷子タイプ',
    T2: 'しんどいタイプ',
    T3: '伸ばせるタイプ',
    T4: 'もったいないタイプ',
  };

  // タイプ説明のマッピング
  const typeDescriptions: Record<string, string> = {
    T1: '方向性がまだ見えていない状態です。',
    T2: '頑張りたい気持ちはあるのに、続ける仕組みがまだ整っていない状態です。',
    T3: '伸びしろを感じつつ、まだ十分に活かせていない状態です。',
    T4: 'もう少しで大きく前進できる状態です。',
  };

  const typeSubTexts: Record<string, string> = {
    T1: '迷いながら進むのは自然なことです。',
    T2: 'あなたの頑張り方が悪いわけではありません。',
    T3: 'ポテンシャルはすでにあります。',
    T4: '土台は十分に整っています。',
  };

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

  // 軸詳細データを作成
  const axisDetails = [
    {
      key: 'design',
      label: '設計力',
      score: computedScores.design,
      description:
        '考え方はとても整理されています。あとは"続ける形"があれば十分です。',
      isLowest: lowestAxis === 'design',
    },
    {
      key: 'production',
      label: '量産力',
      score: computedScores.production,
      description:
        'ここが一番しんどさを感じやすい場所です。あなたの努力が消耗しやすくなっています。',
      isLowest: lowestAxis === 'production',
    },
    {
      key: 'improvement',
      label: '改善力',
      score: computedScores.improvement,
      description: '感覚はすでにあります。仕組みがあれば、かなり強くなります。',
      isLowest: lowestAxis === 'improvement',
    },
    {
      key: 'business',
      label: '事業力',
      score: computedScores.business,
      description: '全体を支える土台はもうできています。',
      isLowest: lowestAxis === 'business',
    },
  ];

  // カスタムメッセージ（モック）
  const customMessages = [
    '今のあなたは、頑張る力はあるのに、それを支える仕組みがまだない状態かもしれません。',
    'だからこそ、疲れやすくなったり、続けるのがしんどく感じやすくなります。',
    'でも、型やストックが少しずつ整えば、今よりずっと楽になります。',
  ];

  // 次の一手（モック）
  const nextSteps = [
    {
      emoji: '🟢',
      label: 'まずできそうなこと',
      description:
        '最近の投稿を3つ見返して、反応がよかったテーマを1つメモするだけで大丈夫です。',
    },
    {
      emoji: '🔵',
      label: '少し慣れたら',
      description: '型を1つ作って、同じ形で5回投稿してみてください。',
    },
    {
      emoji: '🟣',
      label: '余裕が出てきたら',
      description:
        'ネタストックを少しずつ増やして、週5回投稿できる仕組みを整えてみてください。',
    },
  ];

  // ホバー効果用のスタイル
  const buttonHoverStyle = {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#e8f3fa',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
      transform: 'none',
    },
  };

  const buttonHoverBenefitStyle = {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#fff0e6',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
      transform: 'none',
    },
  };

  const handleCTAClick = () => {
    // @MOCK_TO_API: LP遷移（UTMパラメータ付き）
    // 本番実装時: VITE_LP_URL環境変数から取得
    window.open('https://example.com/lp', '_blank');
  };

  const handleBenefitClick = () => {
    // @MOCK_TO_API: UTAGE登録フォーム遷移（UTMパラメータ付き）
    // 本番実装時: VITE_UTAGE_BASE_URL環境変数から取得
    window.open('https://example.com/benefit', '_blank');
  };

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
            {typeNames[computedType] || computedType}
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
            {typeDescriptions[computedType] || ''}
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
            {typeSubTexts[computedType] || ''}
          </Typography>

          {/* 100点満点スコア */}
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
              総合スコア：{totalScore} / 100
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
                    color: axis.isLowest ? '#d9a88a' : '#5a9fd4',
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
                    color: axis.isLowest ? '#d9a88a' : 'rgba(0, 0, 0, 0.75)',
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

        {/* 商品提案CTA */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={4} mb={4} textAlign="center" sx={{background: '#f4f9fd', border: '1px solid #d5e6f2', boxShadow: '0 2px 8px rgba(0,0,0,0.05)'}} */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 4,
            mb: 4,
            textAlign: 'center',
            background: '#f4f9fd',
            border: '1px solid #d5e6f2',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          }}
        >
          {/* 絵文字単体 */}
          {/* MUI: Box textAlign="center" mb={2} */}
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Box component="span" sx={{ fontSize: 32 }}>
              ✨
            </Box>
          </Box>

          {/* MUI: Typography variant="h5" fontSize={19} mb={2.5} fontWeight={400} color="text.secondary" */}
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
            頑張り続けなくても、続けられる形があります。
          </Typography>

          {/* MUI: Typography fontSize={14} color="#7a8a9a" mt={2} mb={4} lineHeight={2.0} */}
          <Typography
            sx={{
              fontSize: 14,
              color: '#7a8a9a',
              mt: 2,
              mb: 4,
              lineHeight: 2.0,
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            無理に選ばなくて大丈夫です。今は"知っておくだけ"で十分です。
          </Typography>

          {/* MUI: Button variant="outlined" color="primary" size="large" fullWidth sx={{ maxWidth: 400, mb: 2, bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} */}
          <Button
            variant="outlined"
            color="primary"
            size="large"
            fullWidth
            onClick={handleCTAClick}
            sx={{
              maxWidth: 400,
              mb: 2,
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderRadius: 3,
              fontSize: 16,
              fontWeight: 400,
              textTransform: 'none',
              py: 1.75,
              ...buttonHoverStyle,
            }}
          >
            仕組み化の選択肢を見てみる
          </Button>

          {/* MUI: Typography variant="caption" color="text.disabled" textAlign="center" */}
          <Typography
            variant="caption"
            color="text.disabled"
            sx={{
              textAlign: 'center',
              fontSize: 13,
              maxWidth: 600,
              mx: 'auto',
              display: 'block',
            }}
          >
            ※ 別タブで商品ページを開きます
          </Typography>
        </Paper>

        {/* 特典登録 */}
        {/* MUI: Paper elevation={0} borderRadius={4} p={4} mb={4} textAlign="center" sx={{background: '#fff8f4', border: '1px solid #f0dbc8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'}} */}
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
          {/* MUI: Typography variant="h5" fontSize={19} mb={2.5} fontWeight={400} color="text.secondary" */}
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

          {/* MUI: Typography variant="body1" color="text.secondary" mb={4} lineHeight={2.0} fontSize={17} */}
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

          {/* MUI: Button variant="outlined" color="primary" size="large" fullWidth sx={{ maxWidth: 400, bgcolor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} */}
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

          {/* MUI: Typography variant="caption" color="text.disabled" mt={2} */}
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
      </Container>
    </PublicLayout>
  );
};

export default ResultPage;
