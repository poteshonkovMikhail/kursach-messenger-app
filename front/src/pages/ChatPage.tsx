import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserById, sendMessage } from '../services/api';
import { type Chat, Message, type User } from '../types';

const logger = {
  info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string, warning?: any) => console.warn(`[WARN] ${message}`, warning),
  debug: (message: string, data?: any) => console.debug(`[DEBUG] ${message}`, data)
};

const ChatPage = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [chat, setChat] = useState<Chat | null>(location.state?.chat || null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      navigate('/chats');
      return;
    }

    if (!chat) {
      fetchChat();
    }

    const intervalId = setInterval(fetchChat, 5000);
    return () => clearInterval(intervalId);
  }, [chatId, navigate]);

  useEffect(() => {
    if (chat) {
      fetchOtherUser();
    }
    scrollToBottom();
  }, [chat]);

  const fetchChat = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(`https://localhost:7058/api/Chats/${chatId}?includeUsers=true`, {
        headers: { 'accept': 'text/plain' }
      });
      const chatData = await response.json();
      
      if (!chatData) {
        navigate('/chats');
        return;
      }

      logger.debug('Fetched chat data:', chatData);
      setChat(chatData);
    } catch (error) {
      logger.error('Error fetching chat', { chatId, error });
    }
  };

  const fetchOtherUser = async () => {
    if (!currentUser?.id || !chat) {
      logger.warn("Current user or chat is not available");
      return;
    }

    logger.debug('Current user ID:', currentUser.id);
    logger.debug('Chat users:', { user1: chat.user1, user2: chat.user2 });

    try {
      let otherUserId: string | undefined;
      
      if (chat.user1?.id === currentUser.id) {
        otherUserId = chat.user2?.id;
      } else if (chat.user2?.id === currentUser.id) {
        otherUserId = chat.user1?.id;
      } else {
        logger.warn("Current user is not part of this chat");
        return;
      }

      if (otherUserId) {
        const user = await getUserById(otherUserId);
        if (user) {
          setOtherUser(user);
        }
      }
    } catch (error) {
      logger.error('Error fetching other user:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chat || !currentUser?.id || !chatId) return;
  
    try {
      setSending(true);
      await sendMessage({ 
        chatId,
        senderId: currentUser.id,
        content: newMessage
      });
      setNewMessage('');
      await fetchChat();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!chat) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading chat...</div>;
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Chat header */}
      <div className="flex items-center bg-green-600 px-4 py-3">
        <button onClick={() => navigate('/chats')} className="mr-2 text-white">
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
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            {otherUser?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="ml-3">
            <div className="font-medium text-white">
              {otherUser?.username || 'Unknown user'}
            </div>
            <div className="text-xs text-green-100">
              {otherUser?.status || 'Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {chat.messages?.length ? (
          [...chat.messages]
            .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
            .map((message, index) => (
              <div
                key={message.messageId || index}
                className={`mb-4 flex ${message.sender?.id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`rounded-lg px-4 py-2 max-w-xs sm:max-w-md ${
                  message.sender?.id === currentUser?.id 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-800'
                }`}>
                  <div>{message.content}</div>
                  <div className={`mt-1 text-right text-xs ${
                    message.sender?.id === currentUser?.id 
                      ? 'text-green-200' 
                      : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="text-gray-500">No messages yet</div>
            <div className="mt-2 text-sm text-gray-400">
              Send a message to start the conversation
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 bg-white p-3">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Type a message"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="ml-2 rounded-full bg-green-600 p-2 text-white disabled:bg-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;