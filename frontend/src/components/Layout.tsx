import React from 'react';
import Header from './Header';
import { Box } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Box component="main" sx={{ py: 3 }}>
        <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
