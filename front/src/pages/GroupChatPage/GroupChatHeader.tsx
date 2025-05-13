// src/pages/GroupChatPage/GroupChatHeader.tsx
import { useState } from 'react';
import { AppBar, IconButton, Toolbar, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import { useParams, useNavigate } from 'react-router-dom';
import { AddUserDialog } from '../../components/participants/AddUserDialog';
import { User } from '../../types';


interface GroupChatHeaderProps {
  title: string;
  isAdmin: boolean;
  onAddUser: (userId: string) => Promise<void>;
  typingStatus?: React.ReactNode;
}

export const GroupChatHeader = ({ title, isAdmin, onAddUser, typingStatus }: GroupChatHeaderProps) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const { groupId } = useParams<{ groupId: string }>();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddUserClick = async () => {
    try {
      // Здесь должна быть логика загрузки доступных пользователей
      // Например: const users = await getAvailableUsers();
      // setAvailableUsers(users);
      setAddUserDialogOpen(true);
    } catch (error) {
      console.error('Error loading users:', error);
    }
    handleMenuClose();
  };

  const handleAddUser = async (userId: string) => {
    try {
      await onAddUser(userId);
      setAddUserDialogOpen(false);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/chats')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" color="inherit" sx={{ flexGrow: 1 }}>
            {title}
            {typingStatus}
          </Typography>
          
          {isAdmin && (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleAddUserClick}>
                  <ListItemIcon>
                    <PersonAddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add Participant</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                  navigate(`/group-chat/${groupId}/participants`);
                  handleMenuClose();
                }}>
                  <ListItemIcon>
                    <PeopleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Participants</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <AddUserDialog
        open={addUserDialogOpen}
        users={availableUsers}
        onClose={() => setAddUserDialogOpen(false)}
        onAdd={handleAddUser}
      />
    </>
  );
};