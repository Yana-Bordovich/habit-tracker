import { useState, useCallback, useEffect } from 'react';
import { communityService } from '../services/api/communityService';

export const useCommunities = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await communityService.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch communities');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommunity = useCallback(async (communityData: any): Promise<any> => {
    setError(null);
    
    try {
      const newCommunity = await communityService.createCommunity(communityData);
      setCommunities(prev => [...prev, newCommunity]);
      return newCommunity;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const joinCommunity = useCallback(async (communityId: number): Promise<void> => {
    setError(null);
    
    try {
      await communityService.joinCommunity(communityId);
      await fetchCommunities();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCommunities]);

  const leaveCommunity = useCallback(async (communityId: number): Promise<void> => {
    setError(null);
    
    try {
      await communityService.leaveCommunity(communityId);
      await fetchCommunities();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave community';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCommunities]);

  const deleteCommunity = useCallback(async (communityId: number): Promise<void> => {
    setError(null);
    
    try {
      await communityService.deleteCommunity(communityId);
      setCommunities(prev => prev.filter(community => community.id !== communityId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete community';
      setError(errorMessage);
      throw new Error(errorMessage);
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
    createCommunity,
    joinCommunity,
    leaveCommunity,
    deleteCommunity,
  };
};