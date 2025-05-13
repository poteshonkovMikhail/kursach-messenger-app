import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Collapse,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Divider
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Message } from '../../types';
import { formatTimestamp } from '../../utils/formatters';
import { useState, useRef, useEffect } from 'react';

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  isEditing?: boolean;
  editedContent?: string;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onContentChange?: (content: string) => void;
  closeOtherMenus?: () => void;
  isFirstMessage?: boolean;
}

export const MessageItem = ({
  message,
  isCurrentUser,
  onEdit,
  onDelete,
  isEditing,
  editedContent,
  onSaveEdit,
  onCancelEdit,
  onContentChange,
  closeOtherMenus,
  isFirstMessage
}: MessageItemProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeOtherMenus?.();
    setShowMenu(!showMenu);
  };

  const handleEditClick = () => {
    onEdit?.(message);
    setShowMenu(false);
  };

  const handleDeleteClick = () => {
    onDelete?.(message.messageId || '');
    setShowMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (messageRef.current && !messageRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box 
      display="flex" 
      justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'}
      mb={2}
      sx={{ position: 'relative' }}
      ref={messageRef}
    >
      <Box
        borderRadius={2}
        px={2}
        py={1}
        bgcolor={isCurrentUser ? 'primary.main' : 'grey.400'}
        color={isCurrentUser ? 'primary.contrastText' : 'text.primary'}
        sx={{ 
          position: 'relative',
          cursor: isCurrentUser && !isEditing ? 'pointer' : 'default',
          '&:hover': {
            boxShadow: isCurrentUser && !isEditing ? '0px 2px 4px rgba(0,0,0,0.2)' : 'none'
          },
          pointerEvents: isEditing ? 'none' : 'auto',
          minWidth: '80px', // Минимальная ширина 80px
          maxWidth: 'min(80%, 600px)', // Максимальная ширина сохранена
          wordWrap: 'break-word',
          whiteSpace: 'pre-line',
          overflowWrap: 'break-word',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}
        onClick={isCurrentUser && !isEditing ? handleToggleMenu : undefined}
      >
        {isEditing ? (
          <Box sx={{ pointerEvents: 'auto', width: '100%' }}>
            <TextField
              fullWidth
              multiline
              value={editedContent}
              onChange={(e) => onContentChange?.(e.target.value)}
              sx={{
                backgroundColor: 'white',
                color: 'black',
                borderRadius: '4px',
                mb: 1,
                minWidth: '80px' // Также для поля редактирования
              }}
              autoFocus
            />
            <Box display="flex" justifyContent="flex-end">
              <IconButton onClick={onSaveEdit} size="small">
                <CheckIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={onCancelEdit} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <>
            <Typography 
              sx={{ 
                whiteSpace: 'pre-line',
                wordBreak: 'break-word',
                maxWidth: '100%',
                display: 'inline',
                minWidth: '80px' // Гарантируем минимальную ширину текста
              }}
            >
              {message.content}
            </Typography>
            <Typography 
              variant="caption" 
              display="block" 
              textAlign="right"
              color={isCurrentUser ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
              sx={{
                width: '100%',
                mt: 0.5,
                minWidth: '50px' // И для времени сообщения
              }}
            >
              {formatTimestamp(message.timestamp)}
            </Typography>
          </>
        )}

        <Collapse in={showMenu && isCurrentUser && !isEditing} timeout="auto" unmountOnExit>
          <Box 
            sx={{ 
              position: 'absolute',
              [isFirstMessage ? 'top' : 'bottom']: '100%',
              left: 0,
              right: 0,
              bgcolor: 'background.paper',
              borderRadius: isFirstMessage ? '0 0 8px 8px' : '8px 8px 0 0',
              boxShadow: 2,
              zIndex: 1200,
              overflow: 'hidden',
              minWidth: '80px'
            }}
          >
            <MenuItem onClick={handleEditClick} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: '36px' }}>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Edit" 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: 'text.primary'
                }}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleDeleteClick} sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: '36px' }}>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Delete" 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  color: 'error.main' 
                }}
              />
            </MenuItem>
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};