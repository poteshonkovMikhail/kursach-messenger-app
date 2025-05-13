// src/App.tsx
import { ThemeProvider, CssBaseline, Container, Alert, Button, Box, Typography } from '@mui/material';
import { appTheme } from './theme';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useEffect, useState } from 'react';

import { ChatsPage } from './pages/ChatsPage/index';
import { ChatPage } from './pages/ChatPage/index';
import { GroupChatPage } from './pages/GroupChatPage/index';
import  { AuthPage }  from './pages/AuthPage';
import { ParticipantsPage } from './pages/ParticipantsPage/index';

const App = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error boundary:', event.error);
      setError(event.error?.message || 'An unknown error occurred');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const ErrorPage = ({ error, onBack }: { error: string; onBack: () => void }) => (
    <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
      <Typography color="error">{error}</Typography>
      <Button onClick={onBack} sx={{ ml: 2 }}>Back to chats</Button>
    </Box>
  );

  if (error) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" color="error" onClick={() => window.location.reload()} fullWidth>
            Reload Application
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/chats" element={<ProtectedRoute><ChatsPage /></ProtectedRoute>} />
          <Route path="/chat/:chatId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/group/:groupId" element={<ProtectedRoute><GroupChatPage /></ProtectedRoute>} />
          <Route path="/group/:groupId/participants" element={<ProtectedRoute><ParticipantsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;