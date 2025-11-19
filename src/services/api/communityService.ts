import { apiClient } from './apiClient';
import type { Community, CreateCommunityData, ApiResponse, CommunityMember } from '../../types';

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

  async getCommunityMembers(communityId: number): Promise<CommunityMember[]> {
    const response = await apiClient.get(`/api/communities/${communityId}/members`);
    return response.data || response;
  },

  async getUserCommunities(): Promise<Community[]> {
    const response = await apiClient.get('/api/user/communities');
    return response.data || response;
  }
};