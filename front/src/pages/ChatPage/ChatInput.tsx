// src/pages/ChatPage/ChatInput.tsx
import { Box, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { FormEvent, useEffect, useRef } from 'react';

interface ChatInputProps {
  newMessage: string;
  sending: boolean;
  onMessageChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export const ChatInput = ({ newMessage, sending, onMessageChange, onSubmit }: ChatInputProps) => {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);  
  

  const handleChange = (value: string) => {
    onMessageChange(value);
    
    // Очищаем предыдущий таймаут
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Устанавливаем новый таймаут для отправки уведомления о печати
    typingTimeoutRef.current = setTimeout(() => {
      // Отправляем уведомление, что пользователь перестал печатать
      if (value === '') {
        onMessageChange('');
      }
    }, 2000); // Задержка перед отправкой уведомления о прекращении печати
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Box component="form" onSubmit={onSubmit} p={2} borderTop={1} borderColor="divider" bgcolor="background.paper">
      <Box display="flex" alignItems="center">
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          value={newMessage}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Type a message"
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: 'grey.100',
            }
          }}
          multiline
          maxRows={4}
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
    </Box>
  );
};