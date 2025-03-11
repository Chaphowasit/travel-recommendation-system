// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // Matches the gradient start color used in your Download button
      main: '#2196F3',
      // Optionally include a light variation
      light: '#21CBF3',
    },
    secondary: {
      main: '#f1f1f1', // Used for the bot bubble background
    },
    background: {
      default: '#fff', // Consistent with your chat window background
    },
  },
  typography: {
    // You can customize the font family and other typography options here
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          padding: '8px 16px',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          // Default background gradient can be applied via the sx prop,
          // but you can also set a default style here if needed.
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 5px 8px 3px rgba(33, 203, 243, .3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
        },
      },
    },
  },
});

export default theme;
