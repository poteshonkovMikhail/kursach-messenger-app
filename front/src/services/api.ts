import axios from 'axios';
import { type User, type Chat, type GroupChat, type Message, type RegisterData, type AuthResponse, type LoginData, type CreateChatRequest } from '../types';

// Base API URL - pointing to the real backend
const API_URL = 'https://localhost:7058/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const checkUsernameAvailability = async (username: string) => {
  try {
    const response = await api.get('/account/check-username', {
      params: { username },
    });
    return response.data.available;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post<AuthResponse>('/account/register', {
      username: data.username,
      email: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Registration failed');
    }
    throw new Error('Registration failed');
  }
};

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post<AuthResponse>('/account/login', {
      usernameOrEmail: data.usernameOrEmail,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Login failed');
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get<User>('/account/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    // Получаем токен из хранилища
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      console.warn('No token found for logout');
      return;
    }

    const response = await api.post(
      '/account/logout',
      {}, // Пустое тело запроса
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    // Даже если выход не удался, продолжаем процесс на клиенте
    throw error;
  }
};

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
      status: user.status,
      avatar: user.avatar
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
      status: response.data.status,
      avatar: response.data.avatar
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

// В api.ts, функция getUserById
export const getUserById = async (userId: string | undefined): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/Users/${userId}`);
    return {
      id: response.data.id,
      username: response.data.username,
      status: response.data.status,
      avatar: response.data.avatar // Добавляем аватар
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

// Аналогично для других функций, например getUsers
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<User[]>('/Users');
    
    return response.data.map(user => ({
      id: user.id,
      username: user.username,
      status: user.status,
      avatar: user.avatar // Добавляем аватар
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
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

// services/api.ts
export const createChat = async (chatData: CreateChatRequest): Promise<Chat | null> => {
  try {
    const response = await api.post<Chat>('/Chats', {
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

export const getMessageById = async (messageId: string | undefined): Promise<Message | null> => { //костыльное undefined
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
  sender: User;
  content: string;
}): Promise<Message | null> => {
  try {
    const response = await api.post<Message>('/Messages', {
      sender: {
        id: messageData.sender.id,
        username: messageData.sender.username,
        status: messageData.sender.status
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