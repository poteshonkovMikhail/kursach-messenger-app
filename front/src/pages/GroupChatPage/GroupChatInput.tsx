// src/pages/GroupChatPage/GroupChatInput.tsx
import { Box, IconButton, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { FormEvent } from 'react';

interface GroupChatInputProps {
  newMessage: string;
  sending: boolean;
  currentUserRole?: string;
  onMessageChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export const GroupChatInput = ({
  newMessage,
  sending,
  currentUserRole,
  onMessageChange,
  onSubmit
}: GroupChatInputProps) => {
  return (
    <Box component="form" onSubmit={onSubmit} p={2} borderTop={1} borderColor="divider" bgcolor="background.paper">
      {currentUserRole !== 'Member' ? (
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type a message"
            disabled={sending}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '24px',
                backgroundColor: 'grey.100',
              }
            }}
          />
          <IconButton
            type="submit"
            disabled={sending || !newMessage.trim()}
            color="primary"
            sx={{ ml: 1 }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      ) : (
        <Typography color="text.secondary" textAlign="center">
          You don't have permission to send messages in this chat
        </Typography>
      )}
    </Box>
  );
};