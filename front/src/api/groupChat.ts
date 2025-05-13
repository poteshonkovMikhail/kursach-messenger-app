// src/api/groupChat.ts
import axios from 'axios';
import { API_URL } from './index';
import { GroupChat, Participant } from '../types';

export const getGroupChats = async (userId: string): Promise<GroupChat[]> => {
    try {
        const response = await axios.get<GroupChat[]>(`${API_URL}/GroupChats/user/${userId}`);
        console.log(response);
        return response.data.map(group => ({
            id: group.id,
            title: group.title,
            admin: group.admin,
            participants: group.participants,
            messages: group.messages || [],
            userRoles: group.userRoles || {} 
        }));
    } catch (error) {
        console.error('Error fetching group chats:', error);
        return [];
    }
};

export const getGroupChatById = async (id: string): Promise<GroupChat | null> => {
    try {
        const response = await axios.get<GroupChat>(`${API_URL}/GroupChats/${id}`);
        return {
            id: response.data.id,
            title: response.data.title,
            admin: response.data.admin,
            participants: response.data.participants,
            messages: response.data.messages || [],
            userRoles: response.data.userRoles || {} // Добавлено
        };
    } catch (error) {
        console.error(`Error fetching group chat ${id}:`, error);
        return null;
    }
};

export const getParticipants = async (groupId: string): Promise<Participant[]> => {
    try {
        const response = await axios.get<Participant[]>(`${API_URL}/GroupChats/${groupId}/participants`);
        return response.data.map(p => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            role: p.role as 'Admin' | 'Promoter' | 'Member',
            statusVisibility: p.statusVisibility || 'online'
        }));
    } catch (error) {
        console.error('Error fetching participants:', error);
        return [];
    }
};

export const createGroupChat = async (data: {
  title: string;
  adminId: string;
  participantIds: string[];
}): Promise<GroupChat> => {
  const response = await fetch(`${API_URL}/GroupChats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      title: data.title,
      adminId: data.adminId,
      participantIds: data.participantIds,
      userRoles: {}
    })
  });
  return await response.json();
};

export const updateUserRole = async (
    groupId: string,
    username: string,
    role: 'Admin' | 'Promoter' | 'Member',
    requestingUsername: string
): Promise<void> => {
    await axios.put(`${API_URL}/GroupChats/${groupId}/roles`, {
        username,
        role,
        requestingUsername
    });
};

export const addParticipant = async (
  groupId: string,
  userId: string,
  requestingUserId: string
): Promise<void> => {
  await fetch(`${API_URL}/GroupChats/${groupId}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      requestingUserId,
      userId
    })
  });
};

export const removeParticipant = async (
  groupId: string,
  userId: string,
  requestingUserId: string
): Promise<void> => {
  await fetch(`${API_URL}/GroupChats/${groupId}/remove`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      requestingUserId,
      userId
    })
  });
};

