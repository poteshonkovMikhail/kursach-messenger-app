// src/components/chats/ChatItem.tsx
import { Avatar, ListItem, ListItemAvatar, ListItemText, Typography, ListItemButton, Box, keyframes } from '@mui/material';
import { Chat } from '../../types';
import { styled } from '@mui/system';

const dotAnimation = keyframes`
  0% { opacity: 0.2; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(-2px); }
  40% { opacity: 0.2; transform: translateY(0); }
  100% { opacity: 0.2; transform: translateY(0); }
`;

const TypingDots = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  marginLeft: theme.spacing(0.5),
  '& span': {
    display: 'inline-block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: theme.palette.text.secondary,
    margin: '0 1px',
    animation: `${dotAnimation} 1.4s infinite ease-in-out`,
    '&:nth-of-type(1)': { animationDelay: '0s' },
    '&:nth-of-type(2)': { animationDelay: '0.2s' },
    '&:nth-of-type(3)': { animationDelay: '0.4s' }
  }
}));

interface ChatItemProps {
  chat: Chat;
  currentUserId?: string;
  isOnline: boolean;
  onClick: () => void;
  typingUsers: Array<{
    userId: string;
    userName: string;
    isTyping: boolean;
  }>;
}

export const ChatItem = ({ chat, currentUserId, onClick, typingUsers, isOnline }: ChatItemProps) => {
  const otherUser = chat.user1?.id === currentUserId ? chat.user2 : chat.user1;
  const lastMessage = chat.messages?.[0];
  const isTyping = typingUsers.some(user => user.isTyping);
  const typingNames = typingUsers.filter(user => user.isTyping).map(user => user.userName);

  if (!otherUser) return null;

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onClick} sx={{ px: 2, py: 1.5 }}>
        <ListItemAvatar>
          <Avatar 
            src={otherUser.avatar?.startsWith('#') ? undefined : otherUser.avatar}
            sx={{ bgcolor: otherUser.avatar?.startsWith('#') ? otherUser.avatar : undefined }}
          >
            {otherUser.userName?.charAt(0).toUpperCase()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1" component="span">
                {otherUser.userName}
              </Typography>
              {otherUser.statusVisibility === 'public' && isOnline && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'success.main',
                    ml: 1,
                  }}
                />
              )}
            </Box>
          }
          secondary={
            isTyping ? (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  component="span" 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontStyle: 'calibri' }}
                >
                  {typingNames.length > 1 ? `${typingNames.join(', ')} печатают` : 'Печатает'}
                  <TypingDots>
                    <span></span>
                    <span></span>
                    <span></span>
                  </TypingDots>
                </Typography>
              </Box>
            ) : (
              lastMessage 
                ? `${lastMessage.sender?.userName || 'Unknown'}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? '...' : ''}`
                : 'No messages yet'
            )
          }
          secondaryTypographyProps={{ 
            noWrap: true,
            component: 'div'
          }}
        />
        {!isTyping && lastMessage?.timestamp && (
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
};