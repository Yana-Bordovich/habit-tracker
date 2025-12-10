// src/hooks/useCommunities.ts
import { useState, useCallback, useEffect } from 'react';
import {
  getCommunities,
  createCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
} from '../services/api/communityService';

export const useCommunities = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить сообщества');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = useCallback(async (communityData: any) => {
    setError(null);
    try {
      const newCommunity = await createCommunity(communityData);
      setCommunities(prev => [...prev, newCommunity]);
      return newCommunity;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось создать сообщество';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const handleJoin = useCallback(async (communityId: number) => {
    setError(null);
    try {
      await joinCommunity(communityId);
      await fetchCommunities();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось присоединиться';
      setError(msg);
      throw new Error(msg);
    }
  }, [fetchCommunities]);

  const handleLeave = useCallback(async (communityId: number) => {
    setError(null);
    try {
      await leaveCommunity(communityId);
      await fetchCommunities();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось выйти';
      setError(msg);
      throw new Error(msg);
    }
  }, [fetchCommunities]);

  const handleDelete = useCallback(async (communityId: number) => {
    setError(null);
    try {
      await deleteCommunity(communityId);
      setCommunities(prev => prev.filter(c => c.id !== communityId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Не удалось удалить сообщество';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    communities,
    loading,
    error,
    fetchCommunities,
    createCommunity: handleCreate,
    joinCommunity: handleJoin,
    leaveCommunity: handleLeave,
    deleteCommunity: handleDelete,
  };
};