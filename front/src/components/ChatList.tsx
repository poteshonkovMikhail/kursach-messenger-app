import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserChats } from '../services/api';
import type { Chat } from '../types';

const ChatList = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchChats = async () => {
      console.log('Fetching chats for user ID:', currentUser?.id); 
  
      if (!currentUser?.id) { 
        console.error('No user ID available. Cannot fetch chats.');
        setError('Authentication required');
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const userChats = await getUserChats(currentUser.id); 

        if (!userChats) {
          throw new Error('Invalid response from server');
        }

        console.log('Chats fetched successfully:', userChats);
        setChats(userChats);
      } catch (err) {
        console.error('An error occurred while loading chats:', err);
        setError('Failed to load chats');
      } finally {
        console.log('Loading state is set to false.');
        setLoading(false);
      }
    };

    fetchChats();
  }, [currentUser?.id]);

  const getOtherUser = (chat: Chat) => {
    if (!currentUser?.id) return null; 
    return chat.user1?.id === currentUser.id ? chat.user2 : chat.user1;
  };


  const getLastMessage = (chat: Chat) => {
    if (!chat.messages || chat.messages.length === 0) return null;
    return chat.messages[chat.messages.length - 1];
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (chats.length === 0) {
    console.log('No chats found for user ID:', currentUser?.id);
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <div className="text-gray-500">{currentUser?.id}</div>
        <div className="mt-2 text-sm text-gray-400">
          Start a new chat to begin messaging
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        const lastMessage = getLastMessage(chat);

        if (!otherUser) return null;

        return (
          <div
            key={chat.chatId}
            onClick={() => navigate(`/chat/${chat.chatId}`, { state: { chat } })}
            className="cursor-pointer border-b border-gray-200 px-4 py-3 transition hover:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                {otherUser.username?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex justify-between">
                  <div className="font-medium">{otherUser.username}</div>
                  {lastMessage?.timestamp && (
                    <div className="text-xs text-gray-500">
                      {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 truncate">
                  {lastMessage?.content || 'No messages yet'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
    
  );
};

export default ChatList;