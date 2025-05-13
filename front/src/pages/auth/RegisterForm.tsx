// src/pages/auth/RegisterForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser, checkUsernameAvailability } from '../../api/auth';
import { 
  Box, 
  Button, 
  FormControl, 
  FormHelperText, 
  Input, 
  InputLabel, 
  Typography,
  Alert
} from '@mui/material';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));

    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailability(value)
        .then(available => setUsernameAvailable(available))
        .catch(err => console.error('Error checking username:', err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword
      });
      
      if (response.token && response.user) {
        login(response.token, response.user, false);
        navigate('/chats');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <InputLabel htmlFor="username">Username</InputLabel>
        <Input
          id="username"
          name="username"
          value={registerData.username}
          onChange={handleChange}
          required
          inputProps={{ minLength: 3, maxLength: 20, pattern: '[a-zA-Z0-9_]+' }}
        />
        {registerData.username.length >= 3 && usernameAvailable !== null && (
          <FormHelperText sx={{ color: usernameAvailable ? 'success.main' : 'error.main' }}>
            {usernameAvailable ? 'Username is available' : 'Username is already taken'}
          </FormHelperText>
        )}
        <FormHelperText>Letters, numbers and underscores only</FormHelperText>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="email">Email</InputLabel>
        <Input
          id="email"
          name="email"
          type="email"
          value={registerData.email}
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
          value={registerData.password}
          onChange={handleChange}
          required
          inputProps={{ minLength: 6 }}
        />
      </FormControl>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={registerData.confirmPassword}
          onChange={handleChange}
          required
          inputProps={{ minLength: 6 }}
        />
      </FormControl>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading || (registerData.username.length >= 3 && usernameAvailable === false)}
      >
        {loading ? 'Registering...' : 'Register'}
      </Button>

      <Box textAlign="center" mt={2}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Button 
            onClick={onSwitchToLogin} 
            color="primary" 
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Login
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};