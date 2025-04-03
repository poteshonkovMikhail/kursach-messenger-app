import axios from 'axios';
import { type User, type Chat, type GroupChat, type Message } from '../types';

// Base API URL - pointing to the real backend
const API_URL = 'https://localhost:7058/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// User API
/*export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/Users/username/${username}`);
    return {
      id: response.data.id,
      username: response.data.username,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};*/

export const getUserByUsername = async (username: string): Promise<User | null> => {
  try {
    // Получаем всех пользователей и фильтруем по username
    const response = await api.get<User[]>('/Users');
    const user = response.data.find(u => u.username === username);
    
    if (!user) return null;
    
    return {
      id: user.id,
      username: user.username,
      status: user.status
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
  try {
    const response = await api.post<User>('/Users', {
      username: userData.username,
      status: userData.status || 'Online'
    });
    return {
      id: response.data.id,
      username: response.data.username,
      status: response.data.status
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// api.ts
export const getUserChats = async (userId: string): Promise<Chat[] | null> => {
  try {
    const response = await api.get<Chat[]>(`/Chats/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error; // Rethrow to handle in component
  }
};

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>('/Users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (userId: string | undefined): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/Users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

export const getUserByIdHelper = async (userId: string | undefined): Promise<User | undefined> => {
  try {
    const response = await api.get<User>(`/Users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return undefined ;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    await api.put(`/Users/${userId}`, userData);
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await api.delete(`/Users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return false;
  }
};

// Chat API
export const getChats = async (): Promise<Chat[]> => {
  try {
    const response = await api.get<Chat[]>('/Chats');
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
};

// In your API service file
export const getChatById = async (chatId: string): Promise<Chat | null> => {
  try {
    const response = await api.get<Chat>(`/Chats/${chatId}`, {
      headers: {
        'accept': 'text/plain' // Добавляем заголовок accept как в cURL
      },
      params: {
        includeUsers: true // Параметр запроса как в cURL
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching chat ${chatId}:`, error);
    return null;
  }
};

export const createChat = async (chatData: Omit<Chat, 'chatId' | 'messages'>): Promise<Chat | null> => {
  try {
    const response = await api.post<Chat>('/Chats', chatData);
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
};

export const updateChat = async (chatId: string, chatData: Partial<Chat>): Promise<boolean> => {
  try {
    await api.put(`/Chats/${chatId}`, chatData);
    return true;
  } catch (error) {
    console.error(`Error updating chat ${chatId}:`, error);
    return false;
  }
};

export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    await api.delete(`/Chats/${chatId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting chat ${chatId}:`, error);
    return false;
  }
};

// GroupChat API
export const getGroupChats = async (): Promise<GroupChat[]> => {
  try {
    const response = await api.get<GroupChat[]>('/GroupChats');
    return response.data;
  } catch (error) {
    console.error('Error fetching group chats:', error);
    return [];
  }
};

export const getGroupChatById = async (groupChatId: string): Promise<GroupChat | null> => {
  try {
    const response = await api.get<GroupChat>(`/GroupChats/${groupChatId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group chat ${groupChatId}:`, error);
    return null;
  }
};

export const createGroupChat = async (groupChatData: Omit<GroupChat, 'chatId' | 'messages' | 'groupChatId'>): Promise<GroupChat | null> => {
  try {
    const response = await api.post<GroupChat>('/GroupChats', groupChatData);
    return response.data;
  } catch (error) {
    console.error('Error creating group chat:', error);
    return null;
  }
};

export const updateGroupChat = async (groupChatId: string, groupChatData: Partial<GroupChat>): Promise<boolean> => {
  try {
    await api.put(`/GroupChats/${groupChatId}`, groupChatData);
    return true;
  } catch (error) {
    console.error(`Error updating group chat ${groupChatId}:`, error);
    return false;
  }
};

export const deleteGroupChat = async (groupChatId: string): Promise<boolean> => {
  try {
    await api.delete(`/GroupChats/${groupChatId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting group chat ${groupChatId}:`, error);
    return false;
  }
};

// Message API
export const getMessages = async (): Promise<Message[]> => {
  try {
    const response = await api.get<Message[]>('/Messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const getMessageById = async (messageId: string): Promise<Message | null> => {
  try {
    const response = await api.get<Message>(`/Messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching message ${messageId}:`, error);
    return null;
  }
};

// In your API service file
export const sendMessage = async (messageData: {
  chatId: string;
  senderId: string;
  content: string;
}): Promise<Message | null> => {
  try {
    const response = await api.post<Message>('/Messages', {
      senderId: messageData.senderId,
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
    await api.put(`/Messages/${messageId}`, messageData);
    return true;
  } catch (error) {
    console.error(`Error updating message ${messageId}:`, error);
    return false;
  }
};

export const deleteMessage = async (messageId: string): Promise<boolean> => {
  try {
    await api.delete(`/Messages/${messageId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting message ${messageId}:`, error);
    return false;
  }
};

export default api;