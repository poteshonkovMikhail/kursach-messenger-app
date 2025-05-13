// src/api/message.ts
import axios from 'axios';
import { API_URL } from './index';
import { Message, User } from '../types';

export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await axios.get<Message[]>(`${API_URL}/Messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const getMessageById = async (messageId: string | undefined): Promise<Message | null> => {
  try {
    const response = await axios.get<Message>(`${API_URL}/Messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error);
    return null;
  }
};

export const sendMessage = async (messageData: {
  chatId: string;
  sender: User;
  content: string;
}): Promise<Message | null> => {
  try {
    const response = await axios.post<Message>(`${API_URL}/Messages`, {
      sender: {
        id: messageData.sender.id,
        userName: messageData.sender.userName,
        status: messageData.sender.statusVisibility
      },
      chatId: messageData.chatId,
      content: messageData.content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const updateMessage = async (messageId: string, messageData: Partial<Message>): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/Messages/${messageId}`, messageData);
    return true;
  } catch (error) {
    console.error(`Error updating message ${messageId}:`, error);
    return false;
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/Messages/${messageId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    return false;
  }
};