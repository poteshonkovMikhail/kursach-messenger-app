// src/pages/GroupChatPage/GroupChatMessages.tsx
import { Box, Typography } from '@mui/material';
import { Message } from '../../types';
import { formatTimestamp } from '../../utils/formatters';
import { MessageItem } from '../../components/common/MessageItem';

interface GroupChatMessagesProps {
  messages: Message[];
  currentUserId?: string;
  onEditMessage: (message: Message) => void;
  editingMessageId?: string | null;
  editedContent: string;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onContentChange: (content: string) => void;
}

export const GroupChatMessages = ({
  messages,
  currentUserId,
  onEditMessage,
  editingMessageId,
  editedContent,
  onSaveEdit,
  onCancelEdit,
  onContentChange
}: GroupChatMessagesProps) => {
  return (
    <Box flex={1} overflow="auto" p={2}>
      {messages?.length ? (
        [...messages]
          .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
          .map((message, index) => {
            const isCurrentUser = message.sender?.id === currentUserId;
            const isEditing = editingMessageId === message.messageId;
            
            return (
              <Box 
                key={message.messageId || index} 
                display="flex" 
                flexDirection="column"
                mb={2}
                alignItems={isCurrentUser ? 'flex-end' : 'flex-start'}
              >
                <Typography variant="caption" color="text.secondary">
                  {message.sender?.userName}
                </Typography>
                <MessageItem
                  message={message}
                  isCurrentUser={isCurrentUser}
                  onEdit={onEditMessage}
                  isEditing={isEditing}
                  editedContent={editedContent}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onContentChange={onContentChange}
                />
              </Box>
            );
          })
      ) : (
        <Box display="flex" height="100%" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography color="text.secondary">No messages yet</Typography>
          <Typography variant="caption" color="text.secondary" mt={1}>
            Send a message to start the conversation
          </Typography>
        </Box>
      )}
    </Box>
  );
};