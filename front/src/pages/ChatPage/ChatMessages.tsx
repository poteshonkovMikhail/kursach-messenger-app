import { Box, Typography, IconButton, Badge, styled } from '@mui/material';
import { Message } from '../../types';
import { MessageItem } from '../../components/common/MessageItem';
import { useEffect, useRef, useState, useCallback } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { deleteMessage } from '../../api/message';

interface ChatMessagesProps {
  messages: Message[];
  currentUserId?: string;
  onEditMessage: (message: Message) => void;
  onDeleteMessage: (messageId: string) => void;
  editingMessageId?: string | null;
  editedContent: string;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onContentChange: (content: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
}

const ScrollButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  right: theme.spacing(4),
  bottom: theme.spacing(12),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  zIndex: 1000,
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
}));

const smoothScrollStyles = `
  .custom-smooth-scroll {
    scroll-behavior: smooth;
    transition: scroll-top 1s ease-in-out;
  }
`;

const CustomBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -4,
    bottom: -4,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const formatMessageContent = (content: string) => {
  if (!content) return content;
  
  const MAX_LINE_LENGTH = 50; // Увеличена максимальная длина строки
  const MIN_WORD_LENGTH_FOR_EARLY_BREAK = 15;
  
  // Если текст без пробелов и очень длинный - разбиваем по символам
  if (!content.includes(' ') && content.length > MAX_LINE_LENGTH) {
    return content.match(new RegExp(`.{1,${MAX_LINE_LENGTH}}`, 'g'))?.join('\n') || content;
  }

  let result = '';
  let currentLineLength = 0;
  let i = 0;

  while (i < content.length) {
    let wordEnd = i;
    while (wordEnd < content.length && content[wordEnd] !== ' ') {
      wordEnd++;
    }
    const word = content.substring(i, wordEnd);
    const wordLength = word.length;

    if (currentLineLength > 0 && 
        (currentLineLength + wordLength > MAX_LINE_LENGTH ||
         (wordLength > MIN_WORD_LENGTH_FOR_EARLY_BREAK && 
          currentLineLength + MIN_WORD_LENGTH_FOR_EARLY_BREAK > MAX_LINE_LENGTH))) {
      result += '\n';
      currentLineLength = 0;
    } else if (currentLineLength > 0) {
      result += ' ';
      currentLineLength++;
    }

    result += word;
    currentLineLength += wordLength;
    i = wordEnd + 1;
  }

  return result;
};

export const ChatMessages = ({
  messages,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  editingMessageId,
  editedContent,
  onSaveEdit,
  onCancelEdit,
  onContentChange,
  setMessages,
  messagesContainerRef
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const prevMessagesLength = useRef(messages.length);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = smoothScrollStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  const scrollToBottom = useCallback((withAnimation = true) => {
    if (!messagesContainerRef.current) return;
  
    const container = messagesContainerRef.current;
    const target = container.scrollHeight - container.clientHeight;
  
    if (!withAnimation) {
      container.scrollTop = target;
      setIsAtBottom(true);
      setNewMessagesCount(0);
      return;
    }
  
    const start = container.scrollTop;
    const duration = 1000;
    const startTime = performance.now();
  
    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOut = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      container.scrollTop = start + (target - start) * easeInOut;
  
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsAtBottom(true);
        setNewMessagesCount(0);
      }
    };
  
    requestAnimationFrame(animateScroll);
  }, []);
  

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const nowAtBottom = scrollHeight - (scrollTop + clientHeight) < 50;
    
    if (nowAtBottom !== isAtBottom) {
        setIsAtBottom(nowAtBottom);
        if (nowAtBottom) {
            setNewMessagesCount(0);
            sessionStorage.removeItem('chatScrollPosition');
        }
    }
  }, [isAtBottom, messagesContainerRef]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, messagesContainerRef]);

  useEffect(() => {
    if (isAtBottom && !editingMessageId && openMenuId === null) {
      scrollToBottom(false);
    } else if (messages.length > prevMessagesLength.current && !isAtBottom) {
      setNewMessagesCount(prev => prev + (messages.length - prevMessagesLength.current));
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isAtBottom, scrollToBottom, editingMessageId, openMenuId]);

  /*const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await deleteMessage(messageId);
      if (success) {
        setMessages(prev => prev.filter(m => m.messageId !== messageId));
        setOpenMenuId(null);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };*/

  const closeOtherMenus = useCallback(() => {
    setOpenMenuId(null);
  }, []);

  return (
    <Box 
      ref={messagesContainerRef}
      p={2}
      sx={{
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {messages?.length ? (
        [...messages]
          .sort((a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime())
          .map((message, index) => {
            // Форматируем контент сообщения
            const formattedContent = formatMessageContent(message.content);
            const key = message.messageId || `msg-${index}`;
            
            return (
              <Box 
                key={key} 
                display="flex" 
                flexDirection="column"
                mb={2}
                alignItems={message.sender?.id === currentUserId ? 'flex-end' : 'flex-start'}
              >
                {message.sender?.userName && message.sender?.id !== currentUserId && (
                  <Typography variant="caption" color="text.secondary">
                    {message.sender.userName}
                  </Typography>
                )}
                
                <MessageItem
                  message={{ ...message, content: formattedContent }}
                  isCurrentUser={message.sender?.id === currentUserId}
                  onEdit={onEditMessage}
                  onDelete={onDeleteMessage}
                  isEditing={editingMessageId === message.messageId}
                  editedContent={editedContent}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  onContentChange={onContentChange}
                  closeOtherMenus={closeOtherMenus}
                  isFirstMessage={index === 0}
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
      <div ref={messagesEndRef} style={{ height: 0 }} />
      
      {!isAtBottom && (
        <ScrollButton 
          onClick={() => scrollToBottom(true)} 
          size="small" 
          aria-label="Scroll to bottom"
        >
          <CustomBadge
            badgeContent={newMessagesCount}
            color="primary"
            overlap="circular"
          >
            <ArrowDownwardIcon fontSize="small" />
          </CustomBadge>
        </ScrollButton>
      )}
    </Box>
  );
};
