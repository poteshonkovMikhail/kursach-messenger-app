// src/api/user.ts
import axios from 'axios';
import { API_URL } from './index';
import { User, Chat } from '../types';

export const getUserByUsername = async (userName: string): Promise<User | null> => {
  try {
    const response = await axios.get<User[]>(`${API_URL}/Users`);
    const user = response.data.find(u => u.userName === userName);
    return user || null;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[] | null> => {
    try {
      const response = await axios.get<Chat[]>(`${API_URL}/Chats/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error; 
    }
  };

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get<User[]>(`${API_URL}/Users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (userId: string | undefined): Promise<User | null> => {
  try {
    const response = await axios.get<User>(`${API_URL}/Users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
  try {
    await axios.put(`${API_URL}/Users/${userId}`, userData);
    return true;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    return false;
  }
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/Users/${userId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    return false;
  }
};