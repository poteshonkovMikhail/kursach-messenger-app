// src/pages/ParticipantsPage/index.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGroupChat } from '../../hooks/useGroupChat';
import { ParticipantItem } from '../../components/participants/ParticipantItem';
import { RoleDialog } from '../../components/participants/RoleDialog';
import { AppBar, Box, CircularProgress, IconButton, List, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Participant } from '../../types';

export const ParticipantsPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    participants,
    loading,
    error,
    changeRole,
    removeUser,
    refetch
  } = useGroupChat();
  
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const currentParticipant = participants.find(p => p.id === currentUser?.id);
  const isAdmin = currentParticipant?.role === 'Admin';
  const isPromoter = currentParticipant?.role === 'Promoter';

  const handleRoleChange = (participant: Participant) => {
    setSelectedParticipant(participant);
    setRoleDialogOpen(true);
  };

  const handleRoleSave = async (role: 'Admin' | 'Promoter' | 'Member') => {
    if (!selectedParticipant || !currentUser?.id) return;
    try {
      await changeRole(selectedParticipant.id, role, currentUser.id);
      refetch();
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleRemoveUser = async (participant: Participant) => {
    if (!currentUser?.id) return;
    try {
      await removeUser(participant.id, currentUser.id);
      refetch();
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">Participants</Typography>
        </Toolbar>
      </AppBar>
      
      <List>
        {participants.map((participant) => (
          <ParticipantItem
            key={participant.id}
            participant={participant}
            isAdmin={isAdmin}
            isPromoter={isPromoter}
            onRoleChange={() => handleRoleChange(participant)}
            onRemove={() => handleRemoveUser(participant)}
          />
        ))}
      </List>

      <RoleDialog
        open={roleDialogOpen}
        participant={selectedParticipant}
        currentUserIsAdmin={isAdmin}
        onClose={() => setRoleDialogOpen(false)}
        onSave={handleRoleSave}
      />
    </Box>
  );
};