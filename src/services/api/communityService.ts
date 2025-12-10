// src/services/api/communityService.ts
const API_URL = 'http://localhost:3001'; // или твой порт

export const getCommunities = async () => {
  const response = await fetch(`${API_URL}/api/communities`);
  if (!response.ok) throw new Error('Не удалось загрузить сообщества');
  return response.json();
};

export const createCommunity = async (communityData: any) => {
  const response = await fetch(`${API_URL}/api/communities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(communityData),
  });
  if (!response.ok) throw new Error('Не удалось создать сообщество');
  return response.json();
};

export const joinCommunity = async (communityId: number) => {
  const response = await fetch(`${API_URL}/api/communities/${communityId}/join`, { method: 'POST' });
  if (!response.ok) throw new Error('Не удалось присоединиться');
};

export const leaveCommunity = async (communityId: number) => {
  const response = await fetch(`${API_URL}/api/communities/${communityId}/leave`, { method: 'POST' });
  if (!response.ok) throw new Error('Не удалось выйти');
};

export const deleteCommunity = async (communityId: number) => {
  const response = await fetch(`${API_URL}/api/communities/${communityId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Не удалось удалить');
};