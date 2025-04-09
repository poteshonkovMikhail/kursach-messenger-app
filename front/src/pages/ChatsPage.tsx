// ChatsPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import ChatList from '../components/ChatList';
import { getUsers, createChat } from '../services/api';
import type { User } from '../types';
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
  Toolbar, 
  Typography 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ListItemButton } from '@mui/material';

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
      const allUsers = await getUsers();
      const otherUsers = allUsers.filter(user => user.id !== currentUser.id);
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
        user1Id: currentUser.id,
        user2Id: otherUserId
      });

      if (newChat?.chatId) {
        setIsNewChatOpen(false);
        navigate(`/chat/${newChat.chatId}`, { 
          state: { 
            chat: {
              ...newChat,
              user1: { 
                id: currentUser.id, 
                username: currentUser.username,
                status: currentUser.status,
                avatar: currentUser.avatar
              },
              user2: { 
                id: otherUserId, 
                username: users.find(u => u.id === otherUserId)?.username,
                status: users.find(u => u.id === otherUserId)?.status,
                avatar: users.find(u => u.id === otherUserId)?.avatar
              }
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
    <Box display="flex" flexDirection="column" height="100vh" bgcolor="background.paper">
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Messenger
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {currentUser?.username}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleLogout}
            sx={{ backgroundColor: 'primary.dark' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box position="relative" flex={1}>
        <Box position="absolute" bottom={24} right={24} zIndex={10}>
          <IconButton
            onClick={() => setIsNewChatOpen(!isNewChatOpen)}
            color="primary"
            sx={{ 
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { backgroundColor: 'primary.dark' },
              width: 56,
              height: 56
            }}
          >
            {isNewChatOpen ? <CloseIcon /> : <AddIcon />}
          </IconButton>
        </Box>

        {isNewChatOpen && (
          <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={20} bgcolor="background.paper">
            <AppBar position="static" color="primary">
              <Toolbar>
                <IconButton edge="start" color="inherit" onClick={() => setIsNewChatOpen(false)}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  New Chat
                </Typography>
              </Toolbar>
            </AppBar>

            <Box flex={1} overflow="auto">
              {loading ? (
                <Box display="flex" height="100%" alignItems="center" justifyContent="center">
                  <CircularProgress />
                </Box>
              ) : users.length === 0 ? (
                <Box display="flex" height="100%" flexDirection="column" alignItems="center" justifyContent="center" p={4}>
                  <Typography color="text.secondary">No users found</Typography>
                </Box>
              ) : (
                <List>
                  {users.map((user) => (
                    <ListItem 
                      key={user.id} 
                      disablePadding
                      onClick={() => startNewChat(user.id)}
                    >
                      <ListItemButton>
                        <ListItemAvatar>
                          <Avatar src={user.avatar}>
                            {user.username?.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={user.username}
                          secondary={user.status || 'Available'}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Box>
        )}

        {!isNewChatOpen && <ChatList />}
      </Box>
    </Box>
  );
};

export default ChatsPage;