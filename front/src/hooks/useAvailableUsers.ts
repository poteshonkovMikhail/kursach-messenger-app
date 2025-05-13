// src/hooks/useAvailableUsers.ts
import { useState, useEffect } from 'react';
import { getUsers } from '../api/user';
import { User } from '../types';

export const useAvailableUsers = (excludeIds: string[]) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getUsers();
      setUsers(allUsers.filter(user => !excludeIds.includes(user.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [excludeIds]);

  return { users, loading, error, refetch: fetchUsers };
};