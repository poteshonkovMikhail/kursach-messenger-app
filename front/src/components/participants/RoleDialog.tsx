// src/components/participants/RoleDialog.tsx
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
    Typography 
  } from '@mui/material';
  import { Participant } from '../../types';
  import { useState, useEffect} from 'react';
  
  interface RoleDialogProps {
    open: boolean;
    participant?: Participant | null;
    currentUserIsAdmin: boolean;
    onClose: () => void;
    onSave: (role: 'Admin' | 'Promoter' | 'Member') => void;
  }
  
  export const RoleDialog = ({
    open,
    participant,
    currentUserIsAdmin,
    onClose,
    onSave
  }: RoleDialogProps) => {
    const [role, setRole] = useState<'Admin' | 'Promoter' | 'Member'>(
      participant?.role || 'Member'
    );
  
    useEffect(() => {
      if (participant) {
        setRole(participant.role);
      }
    }, [participant]);
  
    const handleSave = () => {
      onSave(role);
      onClose();
    };
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          Change Role for {participant?.username}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Admin' | 'Promoter' | 'Member')}
              label="Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Promoter">Promoter</MenuItem>
              <MenuItem value="Member">Member</MenuItem>
            </Select>
          </FormControl>
          {role === 'Admin' && participant && currentUserIsAdmin && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: Assigning Admin role will remove your admin privileges.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  };