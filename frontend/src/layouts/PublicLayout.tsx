import React from 'react';
import { Box } from '@mui/material';

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * 公開ページ用レイアウト（認証不要）
 * - 100vhの背景設定
 * - 中央揃えのコンテンツ領域
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f5f9fc 0%, #fefefe 100%)',
        fontSize: '17px',
        color: 'rgba(0, 0, 0, 0.87)',
        lineHeight: 2.0,
      }}
    >
      {children}
    </Box>
  );
};

export default PublicLayout;
