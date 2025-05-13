// src/pages/auth/LoginForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { loginUser } from '../../api/auth';
import { 
  Box, 
  Button, 
  Checkbox, 
  FormControl, 
  FormHelperText, 
  Input, 
  InputLabel, 
  Typography,
  Alert
} from '@mui/material';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setLoginData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginUser(loginData);
      if (response.token && response.user) {
        login(response.token, response.user, loginData.rememberMe);
        navigate('/chats', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username/email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="usernameOrEmail">Username or Email</InputLabel>
        <Input
          id="usernameOrEmail"
          name="usernameOrEmail"
          value={loginData.usernameOrEmail}
          onChange={handleChange}
          required
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="password">Password</InputLabel>
        <Input
          id="password"
          name="password"
          type="password"
          value={loginData.password}
          onChange={handleChange}
          required
        />
      </FormControl>

      <Box display="flex" alignItems="center" mb={3}>
        <Checkbox
          id="rememberMe"
          name="rememberMe"
          checked={loginData.rememberMe}
          onChange={handleChange}
          color="primary"
        />
        <Typography variant="body2">Remember me</Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Button 
            onClick={onSwitchToRegister} 
            color="primary" 
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Register
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};