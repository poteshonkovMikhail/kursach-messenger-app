// LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { registerUser, loginUser, checkUsernameAvailability } from '../services/api';
import { 
  Box, 
  Button, 
  Checkbox, 
  Container, 
  FormControl, 
  FormHelperText, 
  Input, 
  InputLabel, 
  Link, 
  Paper, 
  Typography 
} from '@mui/material';
import { Alert } from '@mui/material';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { login } = useUser();
  
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loginData, setLoginData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });

  const navigate = useNavigate();

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));

    if (name === 'username' && value.length >= 3) {
      checkUsernameAvailability(value)
        .then(available => setUsernameAvailable(available))
        .catch(err => console.error('Error checking username:', err));
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setLoginData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await registerUser(registerData);
      if (response.token && response.user) {
        login(response.token, response.user, loginData.rememberMe);
        navigate('/chats');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleToggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setUsernameAvailable(null);
  };

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" color="primary">
            {isRegistering ? 'Create Account' : 'Login'}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            {isRegistering ? 'Register to start chatting' : 'Enter your credentials to access your chats'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isRegistering ? (
          <Box component="form" onSubmit={handleRegister}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="username">Username</InputLabel>
              <Input
                id="username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
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
                onChange={handleRegisterChange}
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
          </Box>
        ) : (
          <Box component="form" onSubmit={handleLogin}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel htmlFor="usernameOrEmail">Username or Email</InputLabel>
              <Input
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={loginData.usernameOrEmail}
                onChange={handleLoginChange}
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
                onChange={handleLoginChange}
                required
              />
            </FormControl>

            <Box display="flex" alignItems="center" mb={3}>
              <Checkbox
                id="rememberMe"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
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
          </Box>
        )}

        <Box textAlign="center" mt={2}>
          <Link
            component="button"
            type="button"
            onClick={handleToggleAuthMode}
            color="primary"
            underline="hover"
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;