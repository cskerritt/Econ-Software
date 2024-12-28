import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
} from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Kincaid Wolstein
            </Typography>
          </RouterLink>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/evaluees"
            color="inherit"
          >
            Evaluees
          </Button>
          <Button
            component={RouterLink}
            to="/evaluees/new"
            color="primary"
            variant="contained"
          >
            New Evaluee
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
