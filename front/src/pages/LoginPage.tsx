import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { createUser } from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, setCurrentUser } = useUser();
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!username.trim()) {
    setError('Username cannot be empty');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    if (isRegistering) {
      // Registration - now expects a User object
      const newUser = await createUser({ 
        username, 
        status: 'Online' // Add default status
      });
      if (newUser) {
        setCurrentUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        navigate('/chats');
      } else {
        setError('Failed to register. Please try again.');
      }
    } else {
      // Login remains the same
      const success = await login(username);
      if (success) {
        navigate('/chats');
      } else {
        setError('Username not found. Please register first.');
      }
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
    console.error(err);
  } finally {
    setLoading(false);
  }
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
              ? 'Register with a username to start chatting'
              : 'Enter your username to access your chats'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-1 block font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-400"
          >
            {loading
              ? 'Processing...'
              : isRegistering
              ? 'Register'
              : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
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
