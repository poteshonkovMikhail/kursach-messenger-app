// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: { 
      main: '#2196F3',  // классический синий Material-UI
      light: '#64B5F6',  // светлый голубоватый оттенок
      dark: '#1565C0'    // темно-синий
    },
    secondary: { 
      main: '#4FC3F7',   // голубой
      light: '#81D4FA',   // светлый голубой
      dark: '#0288D1'     // темный голубовато-синий
    },
    error: { 
      main: '#f44336',   // сохранил красный для ошибок
      light: '#e57373', 
      dark: '#d32f2f' 
    },
    background: { 
      default: '#E3F2FD',  // очень светлый голубой фон
      paper: '#FFFFFF'      // белый для бумажных элементов
    },
    text: { 
      primary: '#0D47A1',   // темно-синий для основного текста
      secondary: '#546E7A'  // серо-голубой для второстепенного текста
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 16px' },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        fullWidth: true,
      },
    },
  },
});

/*// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    primary: { main: '#16a34a', light: '#22c55e', dark: '#15803d' },
    secondary: { main: '#059669', light: '#06b97a', dark: '#047857' },
    error: { main: '#dc2626', light: '#ef4444', dark: '#b91c1c' },
    background: { default: '#f3f4f6', paper: '#ffffff' },
    text: { primary: '#111827', secondary: '#6b7280' },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    button: { textTransform: 'none' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 16px' },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
        fullWidth: true,
      },
    },
  },
}); */