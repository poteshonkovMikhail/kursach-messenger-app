import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, IconButton, AppBar, Typography, Toolbar, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { ChatList } from '../../components/chats/ChatList';
import { NewChatDialog } from '../../components/chats/NewChatDialog';
import { NewGroupDialog } from '../../components/chats/NewGroupDialog';
import { createChat } from '../../api/chat';
import { getUserChats } from '../../api/user';
import { createGroupChat, getGroupChats } from '../../api/groupChat';
import { Chat, GroupChat, TypingStatusDto } from '../../types'; 
import { User, OnlineStatusDto } from '../../types';
import { onReceiveTypingStatus, removeTypingStatusListener, onReceiveOnlineStatus, removeOnlineStatusListener } from '../../services/signalR';
import { startUnifiedConnection, joinChat, joinGlobalChatsGroup, updateUserActivity } from '../../services/signalR';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';

export const ChatsPage = () => {
  const { currentUser, logout } = useAuth();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingStatusDto>>({});
  const typingTimeouts = useRef<Record<string, number>>({});
  const navigate = useNavigate();
  const [isSignalRReady, setIsSignalRReady] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
const [onlineStatuses, setOnlineStatuses] = useState<Record<string, OnlineStatusDto>>({});
const onlineTimeouts = useRef<Record<string, number>>({});


// Эффект для периодического обновления активности
useEffect(() => {
  const interval = setInterval(() => {
    if (currentUser?.id) {
      updateUserActivity(currentUser.id).catch(console.error);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [currentUser?.id]);

// Получение онлайн статуса для пользователя
const isUserOnline = (userId: string) => {
  return onlineStatuses[userId]?.isOnline ?? false;
};
  
/*useEffect(() => {
  const handleOnlineStatus = (status: OnlineStatusDto) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      status.isOnline ? newSet.add(status.userId) : newSet.delete(status.userId);
      return newSet;
    });
    
    // Update last seen time if user goes offline
    if (!status.isOnline) {
      // You might want to update your local state or API here
      console.log(`User ${status.userId} is now offline`);
    }
  };

  onReceiveOnlineStatus(handleOnlineStatus);
  return () => removeOnlineStatusListener(handleOnlineStatus);
}, []);*/

  const handleTypingStatus = useCallback((status: TypingStatusDto) => {
    console.log('Received typing status:', status);
    
    if (!status.chatId || !status.userId) {
      console.warn('Invalid typing status received', status);
      return;
    }
  
    if (status.userId === currentUser?.id) return;
  
    const key = `${status.chatId}-${status.userId}`;
    
    // Clear existing timeout
    if (typingTimeouts.current[key]) {
      clearTimeout(typingTimeouts.current[key]);
      delete typingTimeouts.current[key];
    }
  
    setTypingUsers(prev => {
      const newState = { ...prev };
      
      if (status.isTyping) {
        newState[key] = status;
        // Auto-clear after 3 seconds
        typingTimeouts.current[key] = window.setTimeout(() => {
          setTypingUsers(prev => {
            const { [key]: _, ...rest } = prev;
            return rest;
          });
        }, 3000);
      } else {
        delete newState[key];
      }
      
      return newState;
    });
  }, [currentUser?.id]);

const [connection, setConnection] = useState<HubConnection | null>(null);

// Инициализация SignalR соединения
useEffect(() => {
  const initializeSignalR = async () => {
    try {
      const newConnection = await startUnifiedConnection();
      if (!newConnection) return;

      setConnection(newConnection);

      onReceiveOnlineStatus(handleOnlineStatus);
      onReceiveTypingStatus(handleTypingStatus);

      // Присоединение к глобальной группе и отправка статуса
      if (currentUser?.id) {
        await joinGlobalChatsGroup(currentUser.id);
        await newConnection.invoke("UpdateUserActivity", currentUser.id);
        console.log('Global group joined and activity updated');
      }

    } catch (error) {
      console.error('SignalR initialization error:', error);
    }
  };

  initializeSignalR();

  return () => {
    if (connection) {
      removeOnlineStatusListener(handleOnlineStatus);
      removeTypingStatusListener(handleTypingStatus);
      connection.stop().catch(console.error);
    }
  };
}, [currentUser?.id]);

const handleOnlineStatus = useCallback((status: OnlineStatusDto) => {
  console.log('Received online status:', status);
  setOnlineStatuses(prev => ({
    ...prev,
    [status.userId]: status
  }));
}, []);


// В том же файле ChatsPage.tsx
useEffect(() => {
  const interval = setInterval(async () => {
    if (connection?.state === HubConnectionState.Connected && currentUser?.id) {
      try {
        await connection.invoke("PingOnlineStatus", currentUser.id);
      } catch (error) {
        console.error('Error sending ping:', error);
      }
    }
  }, 3000); // Каждые 30 секунд

  return () => clearInterval(interval);
}, [connection, currentUser?.id]);
  
  // Update getTypingUsersForChat to include more details
  const getTypingUsersForChat = useCallback((chatId: string) => {
    return Object.values(typingUsers)
      .filter(status => status?.chatId === chatId)
      .map(status => ({
        userId: status.userId,
        userName: status.userName,
        isTyping: status.isTyping
      }));
  }, [typingUsers]);

// В компоненте ChatsPage
useEffect(() => {
  const initializeSignalR = async () => {
    try {
      const connection = await startUnifiedConnection();
      if (connection) {
        await joinGlobalChatsGroup(currentUser?.id);
        setIsSignalRReady(true);
      }
    } catch (error) {
      console.error('SignalR error:', error);
    }
  };
  initializeSignalR();
}, []);

  // Подписка на события печати после инициализации SignalR
  useEffect(() => {
    if (!isSignalRReady) return;

    onReceiveTypingStatus(handleTypingStatus);
    console.log('Typing status listener activated');

    return () => {
      removeTypingStatusListener(handleTypingStatus);
      Object.values(typingTimeouts.current).forEach(clearTimeout);
      console.log('Typing status listener cleaned up');
    };
  }, [isSignalRReady, handleTypingStatus]);

  // В компоненте ChatsPage
useEffect(() => {
  const joinAllChats = async () => {
    if (!isSignalRReady) return;
    
    // Для личных чатов
    await Promise.all(chats.map(chat => 
      joinChat(chat.id, false, currentUser?.id)
    ));
    
    // Для групповых чатов
    await Promise.all(groupChats.map(group => 
      joinChat(group.id, true, currentUser?.id)
    ));
  };

  joinAllChats();
}, [chats, groupChats, isSignalRReady]);
  

  useEffect(() => {
    fetchChats();
  }, [currentUser?.id]);

  useEffect(() => {
    console.log('Chats data:', { chats, groupChats });
  }, [chats, groupChats]);

  const fetchChats = async () => {
    if (!currentUser?.id) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      setError(null);
      
      const [userChats, userGroupChats] = await Promise.all([
        getUserChats(currentUser.id)
          .then(data => {
            console.log('Fetched regular chats:', data);
            return Array.isArray(data) ? data : [];
          })
          .catch(error => {
            console.error('Error fetching regular chats:', error);
            return [];
          }),
          
        getGroupChats(currentUser.id)
          .then(data => {
            console.log('Fetched group chats:', data);
            return Array.isArray(data) ? data : [];
          })
          .catch(error => {
            console.error('Error fetching group chats:', error);
            return [];
          })
      ]);
      
      setChats(userChats);
      setGroupChats(userGroupChats);
      
      console.log('Updated state:', {
        chats: userChats,
        groupChats: userGroupChats
      });
    } catch (err) {
      console.error('Failed to load chats:', err);
      setError('Failed to load chats. Please try again.');
      setChats([]);
      setGroupChats([]);
    } finally {
      setLoading(false);
    }
};

  const startNewChat = async (otherUserId: string) => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const newChat = await createChat({
        user1Id: currentUser.id,
        user2Id: otherUserId
      });

      if (newChat?.id) {
        setIsNewChatOpen(false);
        navigate(`/chat/${newChat.id}`, { 
          state: { 
            chat: {
              ...newChat,
              user1: { 
                id: currentUser.id, 
                username: currentUser.userName,
                status: currentUser.statusVisibility,
                avatar: currentUser.avatar
              },
              user2: { 
                id: otherUserId, 
                username: users.find(u => u.id === otherUserId)?.userName,
                status: users.find(u => u.id === otherUserId)?.statusVisibility,
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

  const createNewGroup = async (title: string, participantIds: string[]) => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const newGroup = await createGroupChat({
        title,
        adminId: currentUser.id,
        participantIds
      });
      navigate(`/group/${newGroup.id}`);
    } catch (error) {
      console.error('Error creating group chat:', error);
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
            {currentUser?.userName}
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

        <ChatList
          chats={chats}
          groupChats={groupChats}
          loading={loading}
          error={error}
          currentUserId={currentUser?.id}
          onlineStatuses={onlineStatuses}
          typingUsers={getTypingUsersForChat}
          onChatClick={(chat) => navigate(`/chat/${chat.id}`, { state: { chat } })}
          onGroupChatClick={(groupChat) => navigate(`/group/${groupChat.id}`, { state: { groupChat } })}
        />
        

        <NewChatDialog
          open={isNewChatOpen}
          onClose={() => setIsNewChatOpen(false)}
          onStartChat={startNewChat}
          onNewGroup={() => {
            setIsNewChatOpen(false);
            setIsNewGroupOpen(true);
          }}
          currentUserId={currentUser?.id}
        />

        <NewGroupDialog
          open={isNewGroupOpen}
          onClose={() => setIsNewGroupOpen(false)}
          onCreateGroup={createNewGroup}
          currentUserId={currentUser?.id}
        />
      </Box>
    </Box>
  );
};