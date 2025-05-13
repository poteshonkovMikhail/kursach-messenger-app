// src/pages/AuthPage.tsx
import { useState } from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';
import { LoginForm } from './auth/LoginForm';
import { RegisterForm } from './auth/RegisterForm';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" color="primary">
            {isLogin ? 'Login' : 'Create Account'}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            {isLogin ? 'Enter your credentials to access your chats' : 'Register to start chatting'}
          </Typography>
        </Box>

        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </Paper>
    </Container>
  );
};