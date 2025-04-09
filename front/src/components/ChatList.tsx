// ChatList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { getUserChats } from '../services/api';
import type { Chat } from '../types';
import { Avatar, Box, CircularProgress, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';

const ChatList = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser?.id) { 
        setError('Authentication required');
        setLoading(false);
        return;
      }
  
      try {
        setLoading(true);
        const userChats = await getUserChats(currentUser.id);
        if (!userChats) throw new Error('Invalid response from server');
        setChats(userChats);
      } catch (err) {
        setError('Failed to load chats');
      } finally {
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
      <Box display="flex" height="100%" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" height="100%" alignItems="center" justifyContent="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (chats.length === 0) {
    return (
      <Box display="flex" height="100%" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
        <Typography color="text.secondary">
          No chats found for {currentUser?.username}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Start a new chat to begin messaging
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ height: '100%', overflow: 'auto' }}>
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat);
        const lastMessage = getLastMessage(chat);

        if (!otherUser) return null;

        return (
          <ListItem key={chat.chatId} disablePadding>
            <ListItemButton 
              onClick={() => navigate(`/chat/${chat.chatId}`, { state: { chat } })}
              sx={{
                '&:hover': { backgroundColor: 'action.hover' },
                px: 2,
                py: 1.5
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: otherUser.avatar?.startsWith('#') ? otherUser.avatar : undefined }}>
                  {otherUser.username?.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={otherUser.username}
                secondary={lastMessage?.content || 'No messages yet'}
                secondaryTypographyProps={{ noWrap: true }}
              />
              {lastMessage?.timestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                  {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              )}
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default ChatList;