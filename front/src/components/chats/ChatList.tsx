// src/components/chats/ChatList.tsx
import { List, Box, Typography } from '@mui/material';
import { Chat, GroupChat, OnlineStatusDto } from '../../types';
import { ChatItem } from './ChatItem';
import { GroupChatItem } from './GroupChatItem';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ChatListProps {
  chats: Chat[];
  groupChats: GroupChat[];
  loading: boolean;
  error: string | null;
  currentUserId?: string;
  onlineStatuses: Record<string, OnlineStatusDto>;
  typingUsers: (chatId: string) => Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
  }>;
  onChatClick: (chat: Chat) => void;
  onGroupChatClick: (groupChat: GroupChat) => void;
}

export const ChatList = ({
    chats = [],  
    groupChats = [], 
    loading,
    error,
    currentUserId,
    onlineStatuses,
    typingUsers, 
    onChatClick,
    onGroupChatClick
  }: ChatListProps) => {
    
    
    const renderContent = () => {
      if (loading) return <LoadingSpinner />;
    
      if (error) {
        return (
          <Box display="flex" height="100%" alignItems="center" justifyContent="center">
            <Typography color="error">{error}</Typography>
          </Box>
        );
      }
  
      const safeChats = Array.isArray(chats) ? chats : [];
      const safeGroupChats = Array.isArray(groupChats) ? groupChats : [];
  
      if (safeChats.length === 0 && safeGroupChats.length === 0) {
        return (
          <Box display="flex" height="100%" flexDirection="column" alignItems="center" justifyContent="center" p={2}>
            <Typography color="text.secondary">No chats found</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Start a new chat to begin messaging
            </Typography>
          </Box>
        );
      }
  
      return (
        <>
          {safeChats.map((chat) => {
  // Определяем otherUser внутри map
  const otherUser = chat.user1?.id === currentUserId ? chat.user2 : chat.user1;
  const isOnline = otherUser ? onlineStatuses[otherUser.id]?.isOnline : false;
  
  return (
    <ChatItem 
      key={`chat-${chat.id}`} 
      chat={chat} 
      isOnline={isOnline}
      currentUserId={currentUserId}
      onClick={() => onChatClick(chat)}
      typingUsers={typingUsers(chat.id)}
    />
  );
})}
          {safeGroupChats.map((groupChat) => (
            <GroupChatItem
              key={`group-${groupChat.id}`}
              groupChat={groupChat}
              onClick={() => onGroupChatClick(groupChat)}
            />
          ))}
        </>
      );
    };

    return (
      <List sx={{ 
        height: '100%', 
        overflow: 'auto',
        paddingTop: 0,
        paddingBottom: 0,
        '& .MuiListItemButton-root': {
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }
      }}>
        {renderContent()}
      </List>
    );
  };