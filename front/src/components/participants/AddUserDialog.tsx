// src/components/participants/AddUserDialog.tsx
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    ListItemAvatar, 
    Avatar, 
    ListItemText 
  } from '@mui/material';
  import { User } from '../../types';
  import { useState } from 'react';
  
  interface AddUserDialogProps {
    open: boolean;
    users: User[];
    onClose: () => void;
    onAdd: (userId: string) => void;
  }
  
  export const AddUserDialog = ({ open, users, onClose, onAdd }: AddUserDialogProps) => {
    const [selectedUserId, setSelectedUserId] = useState('');
  
    const handleAdd = () => {
      onAdd(selectedUserId);
      setSelectedUserId('');
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Participant</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value as string)}
              label="Select User"
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar}>
                      {user.userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={user.userName} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selectedUserId}>Add</Button>
        </DialogActions>
      </Dialog>
    );
  };