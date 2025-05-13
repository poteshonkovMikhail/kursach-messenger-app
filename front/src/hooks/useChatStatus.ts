import { useCallback, useEffect, useRef } from 'react';
import { 
  notifyTypingSignalR,
  notifyGroupTypingSignalR,
  onReceiveTypingStatus,
  onReceiveGroupTypingStatus,
  removeTypingStatusListener,
  removeGroupTypingStatusListener
} from '../services/signalR';
import { TypingStatusDto } from '../types';

export const useChatStatus = (chatId: string, isGroupChat: boolean) => {
  const typingTimeoutRef = useRef<number>(); // Изменили NodeJS.Timeout на number
  
  const notifyTyping = useCallback(async (isTyping: boolean, userId: string) => {
    try {
      if (isGroupChat) {
        await notifyGroupTypingSignalR(chatId, userId, isTyping);
      } else {
        await notifyTypingSignalR(chatId, userId, isTyping);
      }
    } catch (error) {
      console.error('Error notifying typing status:', error);
    }
  }, [chatId, isGroupChat]);

  const onTypingStatus = useCallback((callback: (status: TypingStatusDto) => void) => {
    if (isGroupChat) {
      onReceiveGroupTypingStatus(callback);
      return () => removeGroupTypingStatusListener(callback);
    } else {
      onReceiveTypingStatus(callback);
      return () => removeTypingStatusListener(callback);
    }
  }, [isGroupChat]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { notifyTyping, onTypingStatus };
};