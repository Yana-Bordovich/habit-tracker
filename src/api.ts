import type { User, AppState } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';

const API_URL = 'http://localhost:3001'; // URL нашего бэкенд-сервера

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Произошла ошибка на сервере');
  }
  return response.json();
};

// Helper function to get current user ID
const getCurrentUserId = (): string => {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) throw new Error('User not authenticated');
  const user = JSON.parse(currentUser);
  return user.id;
};

// Auth functions
export const register = async (username: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

export const login = async (username: string, password: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
};

// State management functions
export const getState = async (userId: string): Promise<AppState> => {
  const response = await fetch(`${API_URL}/api/state`, {
    headers: { 'Authorization': userId },
  });
  const data = await handleResponse(response);
  // Обеспечиваем, что на клиенте всегда есть полный набор достижений
  const achievements = INITIAL_ACHIEVEMENTS.map(initialAch => {
    const savedAch = data.achievements?.find(a => a.id === initialAch.id);
    return savedAch ? { ...initialAch, unlocked: savedAch.unlocked } : initialAch;
  });
  return { ...data, achievements };
};

export const saveState = async (userId: string, state: AppState): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userId,
    },
    body: JSON.stringify(state),
  });
  return handleResponse(response);
};

// Date settings functions
export const getGlobalDateOverride = async (userId: string): Promise<{ date: string | null }> => {
  const response = await fetch(`${API_URL}/api/settings/date`, {
    headers: { 'Authorization': userId },
  });
  return handleResponse(response);
};

export const setGlobalDateOverride = async (userId: string, date: string | null): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/settings/date`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userId,
    },
    body: JSON.stringify({ date }),
  });
  return handleResponse(response);
};

// Communities functions
export const getCommunities = async (): Promise<any[]> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities`, {
    headers: {
      'Authorization': userId
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get communities error response:', errorText);
    throw new Error(`Failed to fetch communities: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const createCommunity = async (community: { name: string; description: string; category: string }): Promise<any> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userId
    },
    body: JSON.stringify(community)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create community error response:', errorText);
    throw new Error(`Failed to create community: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const joinCommunity = async (communityId: number): Promise<any> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities/${communityId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': userId
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Join community error response:', errorText);
    throw new Error(`Failed to join community: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const leaveCommunity = async (communityId: number): Promise<any> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities/${communityId}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': userId
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Leave community error response:', errorText);
    throw new Error(`Failed to leave community: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export const getUserCommunities = async (): Promise<any[]> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/user/communities`, {
    headers: {
      'Authorization': userId
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get user communities error response:', errorText);
    throw new Error(`Failed to fetch user communities: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};