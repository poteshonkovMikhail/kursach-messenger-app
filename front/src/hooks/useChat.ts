// src/hooks/useChat.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getChatById } from '../api/chat';
import { getUserById } from '../api/user';
import { Chat, User } from '../types';
import { useUser } from '../contexts/UserContext';

export const useChat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const location = useLocation();
  const [chat, setChat] = useState<Chat | null>(location.state?.chat || null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useUser();

  const fetchChat = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const chatData = await getChatById(chatId);
      if (!chatData) return;
      setChat(chatData);
    } catch (error) {
      console.error('Error fetching chat', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!chat) {
      fetchChat();
    }
  }, [chatId]);

  return { chat, otherUser, loading };
};
