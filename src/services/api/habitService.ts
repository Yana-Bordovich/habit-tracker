import { apiClient } from './apiClient';

// Updated local types
interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count: number;
  created_at: string;
  is_member?: boolean;
  habits_count: number;
}

interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
}

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// ... rest of the service remains the same
export const communityService = {
  async getCommunities(): Promise<Community[]> {
    const response = await apiClient.get('/api/communities');
    return response.data || response;
  },

  async createCommunity(community: CreateCommunityData): Promise<Community> {
    const response = await apiClient.post('/api/communities', community);
    return response.data || response;
  },

  async joinCommunity(communityId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/api/communities/${communityId}/join`);
  },

  async leaveCommunity(communityId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/api/communities/${communityId}/leave`);
  },

  async deleteCommunity(communityId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/api/communities/${communityId}`);
  },

  async getCommunityMembers(communityId: number): Promise<any[]> {
    const response = await apiClient.get(`/api/communities/${communityId}/members`);
    return response.data || response;
  },

  async getUserCommunities(): Promise<Community[]> {
    const response = await apiClient.get('/api/user/communities');
    return response.data || response;
  }
};