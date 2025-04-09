// App.tsx
import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import LoginPage from './pages/LoginPage';
import ChatsPage from './pages/ChatsPage';
import ChatPage from './pages/ChatPage';
import { Alert, Box, Button, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

function App() {
  const { isAuthenticated } = useUser();
  const [error, setError] = useState<string | null>(null);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#16a34a', // green-600
      },
      secondary: {
        main: '#059669', // green-700
      },
      error: {
        main: '#dc2626', // red-600
      },
      background: {
        default: '#f3f4f6', // gray-100
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
    },
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error boundary:', event.error);
      setError(event.error?.message || 'An unknown error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="error" 
            onClick={() => window.location.reload()}
            fullWidth
          >
            Reload Application
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/chats" /> : <LoginPage />} />
        <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;