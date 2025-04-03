import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import ChatList from '../components/ChatList';
import { getUsers, createChat } from '../services/api';
import type { User } from '../types';

const ChatsPage = () => {
  const { currentUser, logout } = useUser();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isNewChatOpen) {
      fetchUsers();
    }
  }, [isNewChatOpen]);

  const fetchUsers = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const allUsers = await getUsers(); //////////////////////////////////////////////////////////////////////

      // Filter out the current user
      const otherUsers = allUsers.filter(
        (user) => user.id !== currentUser.id
      );

      setUsers(otherUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (otherUserId: string | undefined) => {
    if (!currentUser?.id || !otherUserId) return;

    try {
      setLoading(true);
      const newChat = await createChat({
        user1: { id: currentUser.id },
        user2: { id: otherUserId }
      });

      if (newChat?.chatId) {
        setIsNewChatOpen(false);
        navigate(`/chat/${newChat.chatId}`, { 
          state: { 
            chat: {
              ...newChat,
              user1: { id: currentUser.id, username: currentUser.username },
              user2: { id: otherUserId, username: users.find(u => u.id === otherUserId)?.username }
            } 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    logout();
    navigate('/');

  
  };


  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-green-600 px-4 py-3">
        <div className="text-xl font-semibold text-white">WhatsApp-like</div>
        <div className="flex items-center">
          <div className="mr-4 text-white">{currentUser?.username}</div>
          <button
            onClick={handleLogout}
            className="rounded-md bg-green-700 px-3 py-1 text-sm font-medium text-white hover:bg-green-800"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat list with new chat button */}
      <div className="relative flex-1">
        {/* New chat button */}
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={() => setIsNewChatOpen(!isNewChatOpen)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700"
          >
            {isNewChatOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            )}
          </button>
        </div>

        {/* User list for new chat */}
        {isNewChatOpen && (
          <div className="absolute inset-0 z-20 flex flex-col bg-white">
            <div className="flex items-center bg-green-600 px-4 py-3">
              <button
                onClick={() => setIsNewChatOpen(false)}
                className="mr-2 text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
              <div className="text-xl font-semibold text-white">New Chat</div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-gray-500">Loading users...</div>
                </div>
              ) : users.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-4">
                  <div className="text-gray-500">No users found</div>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => startNewChat(user.id)}
                    className="cursor-pointer border-b border-gray-200 px-4 py-3 transition hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium">{user.username}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {user.status || 'Available'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main chat list */}
        {!isNewChatOpen && <ChatList />}
      </div>
    </div>
  );
};

export default ChatsPage;