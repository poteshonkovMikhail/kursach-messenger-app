// src/api/chat.ts
import axios from 'axios';
import { API_URL } from './index';
import { Chat, CreateChatRequest } from '../types';

export const getChats = async (userId: string) => {
  const response = await fetch(`${API_URL}/Chats/user/${userId}?includeLastMessage=true`, {
    headers: { 'accept': 'text/plain' }
  });
  return await response.json();
};

export const getChatById = async (chatId: string | undefined): Promise<Chat | null> => {
  try {
    const response = await axios.get<Chat>(`${API_URL}/Chats/${chatId}`, {
      headers: { 'accept': 'text/plain' },
      params: { includeUsers: true }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chat ${chatId}:`, error);
    return null;
  }
};

export const createChat = async (chatData: CreateChatRequest): Promise<Chat | null> => {
  try {
    const response = await axios.post<Chat>(`${API_URL}/Chats`, {
      user1Id: chatData.user1Id,
      user2Id: chatData.user2Id
    });
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
};

export const updateChat = async (chatId: string, chatData: Partial<Chat>): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/Chats/${chatId}`, chatData);
    return true;
  } catch (error) {
    console.error(`Error updating chat ${chatId}:`, error);
    return false;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/Chats/${chatId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error);
    return false;
  }
};