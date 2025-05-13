// src/api/auth.ts
import axios from 'axios';
import { API_URL } from './index';
import { AuthResponse, LoginData, RegisterData, User } from '../types';

export const checkUsernameAvailability = async (username: string) => {
  try {
    const response = await axios.get(`${API_URL}/account/check-username`, {
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
    const response = await axios.post<AuthResponse>(`${API_URL}/account/register`, {
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
    const response = await axios.post<AuthResponse>(`${API_URL}/account/login`, {
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
    const response = await axios.get<User>(`${API_URL}/account/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.warn('No token found for logout');
      return;
    }
    const response = await axios.post(
      `${API_URL}/account/logout`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};