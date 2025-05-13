// src/pages/ChatPage/ChatHeader.tsx
import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { User } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderProps {
  otherUser?: User | null;
  typingStatus?: React.ReactNode;
  showTypingStatus?: boolean;
  isOnline?: boolean;
}

export const ChatHeader = ({ otherUser, typingStatus, showTypingStatus, isOnline }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
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
            {otherUser?.userName?.charAt(0).toUpperCase() || '?'}
          </Avatar>
          <Box>
          <Typography variant="subtitle1" color="inherit">
            {otherUser?.userName || 'Unknown user'}
          </Typography>
          {showTypingStatus ? (
            typingStatus
          ) : (
            <Box display="flex" alignItems="center">
              <Typography variant="caption" color="inherit">
                {otherUser?.statusVisibility === 'public' && isOnline ? 'Online' : 'Offline'}
              </Typography>
              {otherUser?.statusVisibility === 'public' && isOnline && (
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
          )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};