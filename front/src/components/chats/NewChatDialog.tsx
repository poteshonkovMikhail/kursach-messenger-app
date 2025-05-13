// src/components/chats/NewChatDialog.tsx
import { useState, useEffect } from 'react';
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
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import { User } from '../../types';
import { getUsers } from '../../api/user';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onStartChat: (userId: string) => void;
  onNewGroup: () => void;
  currentUserId?: string;
}

export const NewChatDialog = ({
  open,
  onClose,
  onStartChat,
  onNewGroup,
  currentUserId
}: NewChatDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const allUsers = await getUsers();
      const otherUsers = allUsers.filter(user => user.id !== currentUserId);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={20} bgcolor="background.paper">
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            New Chat
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<GroupsIcon />}
            onClick={onNewGroup}
          >
            New Group
          </Button>
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
                onClick={() => onStartChat(user.id)}
              >
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.userName}
                    secondary={user.statusVisibility || 'Available'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};