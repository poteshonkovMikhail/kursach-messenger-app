import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserProvider } from '../contexts/UserContext';
import { registerUser, loginUser, checkUsernameAvailability } from '../services/api';

// Вспомогательная функция для логирования
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { login, logout } = useUser();
  
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

  const { setCurrentUser, setToken } = useUser();
  const navigate = useNavigate();

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    log(`Register form change - ${name}: ${value}`);

    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'username' && value.length >= 3) {
      log('Checking username availability', { username: value });
      checkUsernameAvailability(value)
        .then(available => {
          log('Username availability result', { username: value, available });
          setUsernameAvailable(available);
        })
        .catch(err => {
          log('Error checking username availability', { error: err.message });
        });
    }
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    log(`Login form change - ${name}: ${newValue}`);

    setLoginData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    log('Registration started', { registerData });
    setLoading(true);
    setError(null);

    try {
      if (registerData.password !== registerData.confirmPassword) {
        log('Password mismatch', {
          password: registerData.password,
          confirmPassword: registerData.confirmPassword
        });
        throw new Error("Passwords don't match");
      }

      log('Sending registration request', { 
        username: registerData.username,
        email: registerData.email 
      });
      const response = await registerUser(registerData);
      log('Registration response received', { 
        hasToken: !!response.token,
        user: response.user 
      });

      if (response.token && response.user) {
        log('Setting user session', {
          rememberMe: loginData.rememberMe,
          userId: response.user.id
        });
        
        setToken(response.token);
        setCurrentUser(response.user);
        
        if (loginData.rememberMe) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          log('User data stored in localStorage');
        } else {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          log('User data stored in sessionStorage');
        }
        
        log('Navigation to chats');
        navigate('/chats');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      log('Registration error', { 
        error: errorMessage,
        stack: err.stack 
      });
      setError(errorMessage);
    } finally {
      log('Registration process completed');
      setLoading(false);
    }
  };

// components/LoginPage.tsx
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  log('Login started', { 
    usernameOrEmail: loginData.usernameOrEmail,
    rememberMe: loginData.rememberMe 
  });
  setLoading(true);
  setError(null);

  try {
    log('Sending login request');
    const response = await loginUser(loginData);
    log('Login response received', { 
      hasToken: !!response.token,
      user: response.user 
    });

    if (response.token && response.user) {
      log('Setting user session and navigating to chats');
      login(response.token, response.user, loginData.rememberMe); // Используем метод из контекста
      navigate('/chats', { replace: true });
    }
  } catch (err: any) {
    const errorMessage = err.message || 'Invalid username/email or password';
    log('Login error', { 
      error: errorMessage,
      stack: err.stack 
    });
    setError(errorMessage);
  } finally {
    log('Login process completed');
    setLoading(false);
  }
};

  const handleToggleAuthMode = () => {
    log('Toggling auth mode', { 
      from: isRegistering ? 'Register' : 'Login',
      to: isRegistering ? 'Login' : 'Register'
    });
    setIsRegistering(!isRegistering);
    setError(null);
    setUsernameAvailable(null);
  };


  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-600">
            {isRegistering ? 'Create Account' : 'Login'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isRegistering
              ? 'Register to start chatting'
              : 'Enter your credentials to access your chats'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
        )}

        {isRegistering ? (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="username" className="mb-1 block font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter username (3-20 characters)"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
              />
              {registerData.username.length >= 3 && usernameAvailable !== null && (
                <p className={`mt-1 text-xs ${usernameAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {usernameAvailable ? 'Username is available' : 'Username is already taken'}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Letters, numbers and underscores only</p>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="mb-1 block font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="mb-1 block font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="mb-1 block font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || (registerData.username.length >= 3 && usernameAvailable === false)}
              className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="usernameOrEmail" className="mb-1 block font-medium text-gray-700">
                Username or Email
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={loginData.usernameOrEmail}
                onChange={handleLoginChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter username or email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="mb-1 block font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="mb-6 flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={loginData.rememberMe}
                onChange={handleLoginChange}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setUsernameAvailable(null);
            }}
            className="text-sm font-medium text-green-600 hover:text-green-800"
          >
            {isRegistering
              ? 'Already have an account? Log in'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;