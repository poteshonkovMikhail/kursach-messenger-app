import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import LoginPage from './pages/LoginPage';
import ChatsPage from './pages/ChatsPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { isAuthenticated } = useUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for initialization errors
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error boundary:', event.error);
      setError(event.error?.message || 'An unknown error occurred');
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-red-50 p-4">
        <div className="mb-4 text-2xl font-bold text-red-600">Application Error</div>
        <div className="mb-6 text-center text-red-700">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Reload Application
        </button>
      </div>
    );
  }

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  };

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/chats" /> : <LoginPage />} />

      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
