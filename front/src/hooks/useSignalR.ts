import { useEffect, useCallback, useRef } from 'react';
import { 
  startUnifiedConnection,
  joinChat,
  leaveChat,
  onReceiveMessage,
  onReceiveEditedMessage,
  onReceiveDeletedMessage,
  sendMessage,
  editMessage,
  deleteMessage,
  notifyTyping,
  onReceiveTypingStatus,
  removeMessageListener,
  removeTypingStatusListener,
  joinGlobalChatsGroup
} from '../services/signalR';
import { Message, TypingStatusDto, User } from '../types';
import { HubConnection } from '@microsoft/signalr';

interface UseSignalRProps {
  chatId: string | undefined;
  isGroupChat: boolean;
  currentUser: User | null; // Добавляем currentUser в параметры
  onNewMessage: (message: Message) => void;
  onEditedMessage: (message: Message) => void;
  onDeletedMessage: (messageId: string) => void;
  onTypingStatus?: (status: TypingStatusDto) => void;
}

export const useSignalR = ({
  chatId,
  isGroupChat,
  currentUser,
  onNewMessage,
  onEditedMessage,
  onDeletedMessage,
  onTypingStatus
}: UseSignalRProps) => {
  const connectionRef = useRef<HubConnection | null>(null);

  const initializeSignalR = useCallback(async () => {
    if (!chatId || !currentUser?.id) return;
  
  try {
    const connection = await startUnifiedConnection();
    if (!connection) return;
    
    // Подключаемся к глобальной группе и чату одновременно
    await Promise.all([
      joinGlobalChatsGroup(currentUser.id),
      joinChat(chatId, isGroupChat, currentUser.id)
    ]);
    
    // Принудительно отправляем текущий статус
    await connection.invoke("Join", "chats_overview", true, currentUser.id);
      
      // Подписываемся на события
      onReceiveMessage(onNewMessage, isGroupChat);
      onReceiveEditedMessage(onEditedMessage, isGroupChat);
      onReceiveDeletedMessage(onDeletedMessage, isGroupChat);
      
      if (onTypingStatus) {
        onReceiveTypingStatus(onTypingStatus);
      }
      
      console.log('SignalR listeners registered for chat:', chatId);
    } catch (error) {
      console.error('SignalR initialization error:', error);
    }
  }, [chatId, isGroupChat, currentUser?.id, onNewMessage, onEditedMessage, onDeletedMessage, onTypingStatus]);

  useEffect(() => {
    initializeSignalR();

    return () => {
      if (!chatId) return;
      
      leaveChat(chatId);
      removeMessageListener(onNewMessage as any, isGroupChat);
      removeMessageListener(onEditedMessage as any, isGroupChat);
      removeMessageListener(onDeletedMessage as any, isGroupChat);
      
      if (onTypingStatus) {
        removeTypingStatusListener(onTypingStatus);
      }
    };
  }, [initializeSignalR, chatId, isGroupChat]);

  const sendMessageHandler = useCallback(async (
    chatId: string, 
    content: string, 
    userId: string
  ) => {
    try {
      await sendMessage(chatId, content, userId, isGroupChat);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [isGroupChat]);

  const editMessageHandler = useCallback(async (
    messageId: string, 
    newContent: string, 
    userId: string
  ) => {
    try {
      await editMessage(messageId, newContent, userId, isGroupChat);
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }, [isGroupChat]);

  const deleteMessageHandler = useCallback(async (
    messageId: string, 
    userId: string
  ) => {
    try {
      await deleteMessage(messageId, userId, isGroupChat);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, [isGroupChat]);

  const notifyTypingHandler = useCallback(async (
    chatId: string, 
    userId: string, 
    isTyping: boolean
  ) => {
    try {
      await notifyTyping(chatId, userId, isTyping, isGroupChat);
    } catch (error) {
      console.error('Error notifying typing status:', error);
    }
  }, [isGroupChat]);

  return { 
    sendMessage: sendMessageHandler, 
    editMessage: editMessageHandler, 
    deleteMessage: deleteMessageHandler, 
    notifyTyping: notifyTypingHandler 
  };
};