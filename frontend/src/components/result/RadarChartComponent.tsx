import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { useMediaQuery, useTheme } from '@mui/material';
import type { AxisScores, AxisKey } from '@/types';

interface RadarChartComponentProps {
  /** 4軸スコア（0-100） */
  scores: AxisScores;
  /** 最低スコアの軸 */
  lowestAxis: AxisKey;
}

/**
 * 4軸レーダーチャートコンポーネント
 * - 最低軸のみオレンジ色（#d9a88a）で強調
 * - Rechartsを使用
 * - レスポンシブ対応（スマホ/PC自動調整）
 */
export const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  scores,
  lowestAxis,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 軸の順序を定義（上→右→下→左）
  const axisOrder: AxisKey[] = ['design', 'production', 'improvement', 'continuation'];
  const axisLabels: Record<AxisKey, string> = {
    design: '設計力',
    production: '量産力',
    improvement: '改善力',
    continuation: '継続力',
  };

  // レーダーチャート用データを作成
  const chartData = axisOrder.map((key) => ({
    axis: axisLabels[key],
    value: scores[key],
  }));

  // レスポンシブ設定
  const fontSize = isMobile ? 12 : 15;
  const margin = isMobile
    ? { top: 20, right: 40, bottom: 20, left: 40 }
    : { top: 30, right: 60, bottom: 30, left: 60 };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart
        data={chartData}
        margin={margin}
        style={{ outline: 'none', pointerEvents: 'none' }}
      >
        {/* 背景円（目盛り） */}
        <PolarGrid stroke="#f0f0f0" />

        {/* 軸ラベル */}
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: '#666', fontSize, fontWeight: 500 }}
        />

        {/* 半径軸（0-100の範囲を固定） */}
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={false}
        />

        {/* データ領域 */}
        <Radar
          dataKey="value"
          stroke="#5a9fd4"
          fill="rgba(90, 159, 212, 0.15)"
          strokeWidth={2.5}
          activeDot={false}
          dot={(props: { cx?: number; cy?: number; payload?: { axis: string } }) => {
            const { cx, cy, payload } = props;
            if (cx === undefined || cy === undefined || !payload) return null;
            // 最低軸のポイントをオレンジ色で表示
            const isLowest = payload.axis === axisLabels[lowestAxis];
            const fillColor = isLowest ? '#d9a88a' : '#5a9fd4';

            return (
              <circle
                cx={cx}
                cy={cy}
                r={5}
                fill={fillColor}
                stroke="none"
              />
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChartComponent;
