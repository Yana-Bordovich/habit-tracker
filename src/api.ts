import type { User, AppState } from './types';
import { INITIAL_ACHIEVEMENTS } from './constants';

const API_URL = 'http://localhost:3001';


interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

interface AuthCredentials {
  username: string;
  password: string;
}

interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
}

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count: number;
  created_at: string;
}
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', response.status, errorText);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Helper function to get current user ID with better error handling
const getCurrentUserId = (): string => {
  try {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
      throw new Error('No user found in sessionStorage');
    }
    const user = JSON.parse(currentUser);
    if (!user.id) {
      throw new Error('User ID not found');
    }
    console.log('Using user ID:', user.id);
    return user.id;
  } catch (error) {
    console.error('Auth error:', error);
    throw new Error('User not authenticated. Please log in again.');
  }
};

// Helper function to get token from current user
const getToken = (): string => {
  try {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
      throw new Error('No user found in sessionStorage');
    }
    const user = JSON.parse(currentUser);
    if (!user.token) {
      throw new Error('Token not found');
    }
    return user.token;
  } catch (error) {
    console.error('Token error:', error);
    throw new Error('User not authenticated. Please log in again.');
  }
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
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
  const user = await handleResponse(response);

  sessionStorage.setItem('currentUser', JSON.stringify(user));
  console.log('User logged in and saved:', user);
  return user;
};

// State management functions
export const getState = async (userId: string): Promise<AppState> => {
  const response = await fetch(`${API_URL}/api/state`, {
    headers: { 'Authorization': userId },
  });
  const data = await handleResponse(response);
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

// Communities functions
export const getCommunities = async (): Promise<Community[]> => {
  const userId = getCurrentUserId();
  console.log('Fetching communities with user ID:', userId);
  
  const response = await fetch(`${API_URL}/api/communities`, {
    headers: {
      'Authorization': userId
    }
  });
  
  return handleResponse(response);
};

export const createCommunity = async (community: CreateCommunityData): Promise<Community> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userId
    },
    body: JSON.stringify(community)
  });
  
  return handleResponse(response);
};

export const joinCommunity = async (communityId: number): Promise<ApiResponse<void>> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities/${communityId}/join`, {
    method: 'POST',
    headers: {
      'Authorization': userId
    }
  });
  
  return handleResponse(response);
};

export const leaveCommunity = async (communityId: number): Promise<ApiResponse<void>> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities/${communityId}/leave`, {
    method: 'POST',
    headers: {
      'Authorization': userId
    }
  });
  
  return handleResponse(response);
};

export const deleteCommunity = async (communityId: number): Promise<ApiResponse<void>> => {
  const response = await fetch(`${API_URL}/api/communities/${communityId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error('Failed to delete community');
  }

  return response.json();
};

export const getCommunityMembers = async (communityId: number): Promise<any[]> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/communities/${communityId}/members`, {
    headers: {
      'Authorization': userId
    }
  });
  
  return handleResponse(response);
};

export const getUserCommunities = async (): Promise<Community[]> => {
  const userId = getCurrentUserId();
  const response = await fetch(`${API_URL}/api/user/communities`, {
    headers: {
      'Authorization': userId
    }
  });
  
  return handleResponse(response);
};