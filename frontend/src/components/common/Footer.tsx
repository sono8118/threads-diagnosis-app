import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * 共通フッターコンポーネント
 * - 全ページ共通のコピーライト表示
 */
export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        textAlign: 'center',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        mt: 'auto',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(0, 0, 0, 0.6)',
          fontSize: '0.875rem',
        }}
      >
        © 2026 nocco. All Rights Reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
