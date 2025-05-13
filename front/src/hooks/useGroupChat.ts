// src/hooks/useGroupChat.ts
import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  getGroupChatById, 
  getParticipants,
  addParticipant,
  removeParticipant,
  updateUserRole
} from '../api/groupChat';
import { GroupChat, Participant } from '../types';

export const useGroupChat = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const location = useLocation();
  const [groupChat, setGroupChat] = useState<GroupChat | null>(location.state?.groupChat || null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroupChat = useCallback(async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const data = await getGroupChatById(groupId);
      if (!data) throw new Error('Group chat not found');
      setGroupChat(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group chat');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchParticipants = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await getParticipants(groupId);
      setParticipants(data);
    } catch (err) {
      console.error('Error fetching participants:', err);
    }
  }, [groupId]);

  const addUser = useCallback(async (userId: string, currentUserId: string) => {
    if (!groupId) return;
    try {
      await addParticipant(groupId, userId, currentUserId);
      await updateUserRole(groupId, userId, 'Member', currentUserId);
      await fetchParticipants();
      await fetchGroupChat();
    } catch (err) {
      console.error('Error adding participant:', err);
      throw err;
    }
  }, [fetchGroupChat, fetchParticipants, groupId]);

  const changeRole = useCallback(async (
    participantId: string, 
    role: 'Admin' | 'Promoter' | 'Member',
    currentUserId: string
  ) => {
    if (!groupId) return;
    try {
      await updateUserRole(groupId, participantId, role, currentUserId);
      await fetchParticipants();
      await fetchGroupChat();
    } catch (err) {
      console.error('Error updating role:', err);
      throw err;
    }
  }, [fetchGroupChat, fetchParticipants, groupId]);

  const removeUser = useCallback(async (userId: string, currentUserId: string) => {
    if (!groupId) return;
    try {
      await removeParticipant(groupId, userId, currentUserId);
      await fetchParticipants();
    } catch (err) {
      console.error('Error removing participant:', err);
      throw err;
    }
  }, [fetchParticipants, groupId]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchGroupChat(), fetchParticipants()]);
    };
    loadData();
  }, [fetchGroupChat, fetchParticipants]);

  return {
    groupChat,
    participants,
    loading,
    error,
    addUser,
    changeRole,
    removeUser,
    refetch: fetchGroupChat
  };
};
