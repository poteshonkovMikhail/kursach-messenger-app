// src/components/chats/NewGroupDialog.tsx
import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { User } from '../../types';

interface NewGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (title: string, participantIds: string[]) => void;
  currentUserId?: string;
}

export const NewGroupDialog = ({
  open,
  onClose,
  onCreateGroup,
  currentUserId
}: NewGroupDialogProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupTitle, setGroupTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id) 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    if (!currentUserId || !groupTitle || selectedUsers.length === 0) return;
    try {
      setLoading(true);
      await onCreateGroup(
        groupTitle,
        [...selectedUsers.map(u => u.id), currentUserId]
      );
      onClose();
      setGroupTitle('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error creating group chat:', error);
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
            New Group Chat
          </Typography>
        </Toolbar>
      </AppBar>

      <Box flex={1} overflow="auto" p={2}>
        <TextField
          fullWidth
          label="Group Title"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Selected Participants ({selectedUsers.length})
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {selectedUsers.map(user => (
            <Chip
              key={user.id}
              avatar={<Avatar src={user.avatar}>{user.userName.charAt(0)}</Avatar>}
              label={user.userName}
              onDelete={() => toggleUserSelection(user)}
            />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Available Users
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography color="text.secondary">No users found</Typography>
        ) : (
          <List>
            {users.map((user) => (
              <ListItem 
                key={user.id} 
                disablePadding
                onClick={() => toggleUserSelection(user)}
              >
                <ListItemButton selected={selectedUsers.some(u => u.id === user.id)}>
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

      <Box p={2} borderTop={1} borderColor="divider">
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleCreateGroup}
          disabled={!groupTitle || selectedUsers.length === 0 || loading}
        >
          Create Group
        </Button>
      </Box>
    </Box>
  );
};