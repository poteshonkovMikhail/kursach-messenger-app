import { Box, Typography, keyframes, styled, IconButton, Paper, Collapse } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSignalR } from '../../hooks/useSignalR';
import { Message, Chat, User, TypingStatusDto, OnlineStatusDto } from '../../types';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { getUserById } from '../../api/user';
import { getChatById } from '../../api/chat';
import { 
  onReceiveTypingStatus, 
  removeTypingStatusListener, 
  onReceiveOnlineStatus, removeOnlineStatusListener,
  startUnifiedConnection, 
  joinGlobalChatsGroup,
  updateUserActivity 
} from '../../services/signalR';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Анимация для точек
const dotAnimation = keyframes`
  0% { opacity: 0.2; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(-2px); }
  40% { opacity: 0.2; transform: translateY(0); }
  100% { opacity: 0.2; transform: translateY(0); }
`;

// Стилизованный индикатор с анимированными точками
const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: theme.spacing(1),
  '& span': {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    margin: '0 2px',
    animation: `${dotAnimation} 1.4s infinite ease-in-out`,
    '&:nth-of-type(1)': {
      animationDelay: '0s'
    },
    '&:nth-of-type(2)': {
      animationDelay: '0.2s'
    },
    '&:nth-of-type(3)': {
      animationDelay: '0.4s'
    }
  }
}));


export const ChatPage = () => {
  
    const { chatId } = useParams<{ chatId: string }>();
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState<TypingStatusDto[]>([]);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);       
    const [logs, setLogs] = useState<string[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [onlineStatuses, setOnlineStatuses] = useState<Record<string, OnlineStatusDto>>({});
    const [connection, setConnection] = useState<HubConnection | null>(null);
const addLog = useCallback((message: string) => {
  const timestamp = new Date().toISOString().substring(11, 19);
  setLogs(prev => [...prev, `${timestamp}: ${message}`].slice(-20));
}, []);

    // Инициализация SignalR соединения
    useEffect(() => {
      const initializeSignalR = async () => {
        try {
          const newConnection = await startUnifiedConnection();
          if (!newConnection) return;
  
          setConnection(newConnection);
  
          // Подписка на события онлайн-статусов
          onReceiveOnlineStatus(handleOnlineStatus);
          
          // Присоединение к глобальной группе
          if (currentUser?.id) {
            await joinGlobalChatsGroup(currentUser.id);
            await updateUserActivity(currentUser.id);
          }
  
        } catch (error) {
          console.error('SignalR initialization error:', error);
        }
      };
  
      initializeSignalR();
  
      return () => {
        if (connection) {
          removeOnlineStatusListener(handleOnlineStatus);
          connection.stop().catch(console.error);
        }
      };
    }, [currentUser?.id]);
  
    // Обработчик онлайн-статусов
    const handleOnlineStatus = useCallback((status: OnlineStatusDto) => {
      setOnlineStatuses(prev => {
        if (prev[status.userId]?.isOnline === status.isOnline) return prev;
        
        return {
          ...prev,
          [status.userId]: status
        };
      });
    }, []);
  
    // Периодическое обновление активности
    useEffect(() => {
      const interval = setInterval(() => {
        if (connection?.state === HubConnectionState.Connected && currentUser?.id) {
          updateUserActivity(currentUser.id).catch(console.error);
        }
      }, 3000);
  
      return () => clearInterval(interval);
    }, [connection, currentUser?.id]);

    
  useEffect(() => {
    if (!otherUser?.id) return;
  
    const checkUserStatus = async () => {
      try {
        const user = await getUserById(otherUser.id);
        if (!user) {
          addLog(`User ${otherUser.id} not found`);
          return;
        }
        
        const newStatus: OnlineStatusDto = {
          userId: user.id,
          isOnline: user.isOnline ?? false,
          lastActive: user.lastSeen ? new Date(user.lastSeen).toISOString() : new Date().toISOString()
        };
  
        setOnlineStatuses(prev => {
          const currentStatus = prev[user.id];
          // Обновляем только если статус изменился
          if (currentStatus?.isOnline === newStatus.isOnline) return prev;
          
          addLog(`Status changed for ${user.userName}: ${newStatus.isOnline ? 'online' : 'offline'}`);
          return {
            ...prev,
            [user.id]: newStatus
          };
        });
  
      } catch (error) {
        console.error('Status check error:', error);
        addLog(`Status check failed for ${otherUser.userName}`);
      }
    };
  
    checkUserStatus();
    const interval = setInterval(checkUserStatus, 15000);
    return () => clearInterval(interval);
  }, [otherUser?.id, addLog]);
  
  // Эффект для установки статуса
  useEffect(() => {
    if (otherUser?.id) {
      const status = onlineStatuses[otherUser.id];
      if (status) {
        setIsOnline(prev => {
          if (prev !== status.isOnline) {
            addLog(`Updated online status for ${otherUser.userName}: ${status.isOnline ? 'online' : 'offline'}`);
            return status.isOnline;
          }
          return prev;
        });
      }
    }
  }, [onlineStatuses, otherUser, addLog]);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



useEffect(() => {
  const handleStatus = (status: TypingStatusDto) => {
    console.log('Processing typing status:', status);
    setTypingUsers(prev => {
      if (!status.isTyping) {
        return prev.filter(u => u.userId !== status.userId);
      }
      return prev.some(u => u.userId === status.userId) 
        ? prev.map(u => u.userId === status.userId ? status : u)
        : [...prev, status];
    });
  };

  const setupConnection = async () => {
    try {
      await onReceiveTypingStatus(handleStatus);
      console.log('Typing status listener initialized');
    } catch (error) {
      console.error('Failed to setup typing listener:', error);
    }
  };

  setupConnection();

  return () => {
    removeTypingStatusListener(handleStatus);
  };
}, []);



// Обработчик статуса печати с логированием
const handleTypingStatus = useCallback((status: TypingStatusDto) => {
  // Пропускаем статусы от текущего пользователя
  if (status.userId === currentUser?.id || !status.userId || !status.userName) {
    return;
  }
  
  // Validate the status object
  if (!status.userId || !status.userName) {
    addLog(`Invalid typing status received: ${JSON.stringify(status)}`);
    return;
  }
  
  addLog(`Received typing status: ${status.userName} (${status.userId}) - ${status.isTyping ? 'typing' : 'stopped'}`);
  
  setTypingUsers(prevUsers => {
    const newUsers = !status.isTyping
      ? prevUsers.filter(user => user.userId !== status.userId)
      : [...prevUsers.filter(u => u.userId !== status.userId), status];
    
    addLog(`Updated typing users: ${newUsers.map(u => u.userName).join(', ')}`);
    return newUsers;
  });

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }
  
  if (status.isTyping) {
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== status.userId);
        addLog(`Auto-removed typing user: ${status.userName} after timeout`);
        return filtered;
      });
    }, 3000);
  }
}, [addLog, currentUser?.id]);

    // Инициализация SignalR
    const { sendMessage, editMessage, deleteMessage, notifyTyping } = useSignalR({
      chatId,
      isGroupChat: false,
      currentUser, 
      onNewMessage: useCallback((message: Message) => {
        setMessages(prev => {
          const withoutTemp = prev.filter(m => !m.messageId.startsWith('temp-'));
          if (withoutTemp.some(m => m.messageId === message.messageId)) {
            return withoutTemp;
          }
          return [...withoutTemp, message];
        });
      }, []),
      onEditedMessage: useCallback((message: Message) => 
        setMessages(prev => prev.map(m => m.messageId === message.messageId ? message : m)), 
      []),
      onDeletedMessage: useCallback((messageId: string) => 
        setMessages(prev => prev.filter(m => m.messageId !== messageId)), 
      []),
      onTypingStatus: useCallback((status: TypingStatusDto) => {
        if (status.userId === currentUser?.id || status.userId !== otherUser?.id) return;
        setTypingUsers(prev => 
          !status.isTyping 
            ? prev.filter(u => u.userId !== status.userId)
            : [...prev.filter(u => u.userId !== status.userId), status]
        );
      }, [currentUser?.id, otherUser?.id])
    });

  useEffect(() => {
    const setupConnection = async () => {
        try {
            addLog('Setting up typing status listener...');
            await onReceiveTypingStatus(handleTypingStatus);
            addLog('Typing status listener initialized successfully');
        } catch (error) {
            addLog(`Failed to setup typing listener: ${error}`);
        }
    };

    setupConnection();
    return () => {
        removeTypingStatusListener(handleTypingStatus);
        addLog('Typing status listener removed');
    };
}, [handleTypingStatus, addLog]);

const handleMessageChange = useCallback((content: string) => {
  if (editingMessageId) {
      setEditedContent(content);
  } else {
      setNewMessage(content);
  }

  if (chatId && currentUser?.id) {
      const isTyping = content.trim().length > 0;
      notifyTyping(chatId, currentUser.id, isTyping);
  }
}, [chatId, currentUser?.id, editingMessageId, notifyTyping]);

    const handleDeleteMessage = useCallback(async (messageId: string) => {
      if (!messageId || !currentUser?.id) return;
      
      try {
        setMessages(prev => prev.filter(m => m.messageId !== messageId));
        await deleteMessage(messageId, currentUser.id);
        
        const updatedMessages = await getChatById(chatId);
        if (updatedMessages?.messages) {
          setMessages(updatedMessages.messages);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message');
        
        const originalMessage = messages.find(m => m.messageId === messageId);
        if (originalMessage) {
          setMessages(prev => [...prev, originalMessage].sort((a, b) => {
            const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return aTime - bTime;
          }));
        }
      }
    }, [deleteMessage, currentUser?.id, chatId, messages]);

    const handleEditMessage = useCallback((message: Message) => {
        setEditingMessageId(message.messageId || null);
        setEditedContent(message.content);
        setNewMessage('');
    }, []);

    useEffect(() => {
        const loadChatData = async () => {
            try {
                const chatData = await getChatById(chatId);
                setChat(chatData);
                
                if (chatData && currentUser) {
                    const otherUserId = chatData.user1?.id === currentUser.id 
                        ? chatData.user2?.id 
                        : chatData.user1?.id;
                    
                    if (otherUserId) {
                        const user = await getUserById(otherUserId);
                        setOtherUser(user);
                    }
                }
            } catch (error) {
                console.error('Error loading chat:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChatData();
    }, [chatId, currentUser]);

    // Сохранение позиции скролла
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (messagesContainerRef.current) {
                sessionStorage.setItem('chatScrollPosition', messagesContainerRef.current.scrollTop.toString());
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

    // Загрузка сообщений чата
    useEffect(() => {
        if (chat?.messages) {
            setMessages(chat.messages);
            
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
                }
            }, 0);
        }
    }, [chat?.messages]);

    // Очистка таймеров при размонтировании
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // В обработчике отправки сообщений
const handleSend = useCallback(async () => {
  if (!chatId || !currentUser?.id) return;
  
  try {
    if (editingMessageId) {
      // Оптимистичное обновление для редактирования
      setMessages(prev => prev.map(msg => 
        msg.messageId === editingMessageId 
          ? { ...msg, content: editedContent } 
          : msg
      ));
      
      await editMessage(editingMessageId, editedContent, currentUser.id);
    } else if (newMessage.trim()) {
      // Создание временного сообщения
      const tempMessage: Message = {
        messageId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: newMessage,
        sender: currentUser,
        timestamp: new Date().toISOString(), 
        chatOrGroupChatId: chatId
      };
      
      // Оптимистичное обновление
      setMessages(prev => [...prev, tempMessage]);
      await sendMessage(chatId, newMessage, currentUser.id);
    }
    
    setEditingMessageId(null);
    setEditedContent('');
    setNewMessage('');
  } catch (error) {
    console.error('Error:', error);
    alert('Operation failed');
    // Откат изменений
    if (editingMessageId) {
      setMessages(prev => prev.map(msg => 
        msg.messageId === editingMessageId 
          ? { ...msg, content: messages.find(m => m.messageId === editingMessageId)?.content || '' } 
          : msg
      ));
    } else {
      setMessages(prev => prev.filter(m => !m.messageId.startsWith('temp-')));
    }
  }
}, [chatId, currentUser, newMessage, editingMessageId, editedContent, sendMessage, editMessage, messages]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSend();
    }, [handleSend]);

    const handleCancelEdit = useCallback(() => {
        setEditingMessageId(null);
        setEditedContent('');
    }, []);

    if (loading && !chat) {
        return <Box p={2}>Loading chat...</Box>;
    }

    const filteredTypingUsers = typingUsers.filter(user => 
      user.userId === otherUser?.id && 
      user.userId !== currentUser?.id &&
      user.userName
    );

    return (
      <Box display="flex" flexDirection="column" height="100vh">
          <ChatHeader 
          otherUser={otherUser}
          isOnline={isOnline}
           />
          
          {/* Логирование */}
          <Box sx={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1500 }}>
              <IconButton onClick={() => setShowLogs(!showLogs)}>
                  {showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Collapse in={showLogs}>
                  <Paper sx={{ 
                      p: 1, 
                      maxHeight: 200, 
                      overflow: 'auto',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: 'white'
                  }}>
                      <Typography variant="subtitle2">Typing Status Logs:</Typography>
                      {logs.map((log, i) => (
                          <Typography key={i} variant="caption" display="block">
                              {log}
                          </Typography>
                      ))}
                  </Paper>
              </Collapse>
          </Box>

          <Box flex={1} overflow="auto" ref={messagesContainerRef}
              sx={{ height: 'calc(100vh - 120px)', position: 'relative' }}>
              
              {/* Индикатор печати с визуальным логированием */}
              {typingUsers.length > 0 && (
  <Box sx={{
    position: 'fixed',
    top: 60,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1400,
    pointerEvents: 'none',
    animation: `${fadeIn} 0.3s ease-out`
  }}>
    <Box sx={{
      backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(25, 25, 25, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderRadius: '30px',
      px: 2,
      py: 1.5,
      boxShadow: 3,
      display: 'flex',
      alignItems: 'center',
      backdropFilter: 'blur(10px)',
      border: theme => `1px solid ${theme.palette.divider}`,
      transform: 'translateY(0)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 6
      }
    }}>
      {filteredTypingUsers
        .map(user => (
          <Box key={user.userId} sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <Typography variant="caption" sx={{ 
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.8rem'
            }}>
              {user.userName} печатает
              <TypingIndicator>
                <span></span>
                <span></span>
                <span></span>
              </TypingIndicator>
            </Typography>
          </Box>
        ))
      }
    </Box>
  </Box>
)}      
              <ChatMessages
                  messages={messages}
                  currentUserId={currentUser?.id}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  editingMessageId={editingMessageId}
                  editedContent={editedContent}
                  onSaveEdit={async () => {
                      if (editingMessageId && editedContent && currentUser?.id) {
                          await editMessage(editingMessageId, editedContent, currentUser.id);
                          setEditingMessageId(null);
                          setEditedContent('');
                      }
                  }}
                  onCancelEdit={handleCancelEdit}
                  onContentChange={setEditedContent}
                  setMessages={setMessages}
                  messagesContainerRef={messagesContainerRef}
              />
              <div ref={messagesEndRef} />
          </Box>
          
          <ChatInput
              newMessage={editingMessageId ? editedContent : newMessage}
              sending={loading}
              onMessageChange={handleMessageChange}
              onSubmit={handleSendMessage}
          />
      </Box>
  );
};