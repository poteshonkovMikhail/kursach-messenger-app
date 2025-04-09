// ChatPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getMessageById, getUserById, sendMessage } from '../services/api';
import { type Chat, Message, type User } from '../types';
import { 
  AppBar, 
  Avatar, 
  Box, 
  Button, 
  CircularProgress, 
  IconButton, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  TextField, 
  Toolbar, 
  Typography 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

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
      setChat(chatData);
    } catch (error) {
      console.error('Error fetching chat', error);
    }
  };

  const fetchOtherUser = async () => {
    if (!currentUser?.id || !chat) return;
    try {
      let otherUserId: string | undefined;
      if (chat.user1?.id === currentUser.id) {
        otherUserId = chat.user2?.id;
      } else if (chat.user2?.id === currentUser.id) {
        otherUserId = chat.user1?.id;
      } else {
        console.warn("Current user is not part of this chat");
        return;
      }

      if (otherUserId) {
        const user = await getUserById(otherUserId);
        if (user) {
          setOtherUser(user);
        }
      }
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || !currentUser?.id || !chatId) return;
  
    try {
      setSending(true);
      await sendMessage({ 
        chatId,
        sender: currentUser,
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
    return (
      <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" height="100vh" bgcolor="background.default">
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/chats')}>
            <ArrowBackIcon />
          </IconButton>
          <Box display="flex" alignItems="center" ml={2}>
            <Avatar 
              src={otherUser?.avatar?.startsWith('#') ? undefined : otherUser?.avatar}
              sx={{ 
                bgcolor: otherUser?.avatar?.startsWith('#') ? otherUser.avatar : undefined,
                mr: 2 
              }}
            >
              {otherUser?.username?.charAt(0).toUpperCase() || '?'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" color="inherit">
                {otherUser?.username || 'Unknown user'}
              </Typography>
              <Typography variant="caption" color="inherit">
                {otherUser?.status || 'Offline'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box flex={1} overflow="auto" p={2}>
        {chat.messages?.length ? (
          [...chat.messages]
            .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
            .map((message, index) => {
              const isCurrentUser = message.sender?.id === currentUser?.id;
              
              return (
                <Box 
                  key={message.messageId || index} 
                  display="flex" 
                  justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
                  mb={2}
                >
                  <Box
                    borderRadius={2}
                    px={2}
                    py={1}
                    bgcolor={isCurrentUser ? 'primary.main' : 'grey.300'}
                    color={isCurrentUser ? 'primary.contrastText' : 'text.primary'}
                  >
                    <Typography>{message.content}</Typography>
                    <Typography 
                      variant="caption" 
                      display="block" 
                      textAlign="right"
                      color={isCurrentUser ? 'primary.light' : 'text.secondary'}
                    >
                      {formatTimestamp(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
        ) : (
          <Box display="flex" height="100%" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography color="text.secondary">No messages yet</Typography>
            <Typography variant="caption" color="text.secondary" mt={1}>
              Send a message to start the conversation
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box component="form" onSubmit={handleSendMessage} p={2} borderTop={1} borderColor="divider" bgcolor="background.paper">
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                backgroundColor: 'grey.100',
              }
            }}
          />
          <IconButton
            type="submit"
            disabled={sending || !newMessage.trim()}
            color="primary"
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatPage;