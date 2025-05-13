// src/components/participants/ParticipantItem.tsx
import { Avatar, IconButton, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Participant } from '../../types';

interface ParticipantItemProps {
  participant: Participant;
  isAdmin: boolean;
  isPromoter: boolean;
  onRoleChange: () => void;
  onRemove: () => void;
}

export const ParticipantItem = ({
  participant,
  isAdmin,
  isPromoter,
  onRoleChange,
  onRemove
}: ParticipantItemProps) => {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={participant.avatar} />
      </ListItemAvatar>
      <ListItemText 
        primary={participant.username} 
        secondary={participant.role} 
      />
      {(isAdmin || (isPromoter && participant.role === 'Member')) && (
        <IconButton onClick={onRoleChange}>
          <EditIcon />
        </IconButton>
      )}
      {(isAdmin || isPromoter) && participant.role !== 'Admin' && (
        <IconButton onClick={onRemove}>
          <PersonRemoveIcon />
        </IconButton>
      )}
    </ListItem>
  );
};