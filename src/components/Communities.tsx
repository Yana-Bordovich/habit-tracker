import React, { useState, useEffect } from 'react';
import * as api from '../api';

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count: number;
  habits_count: number;
  joined_at?: string;
}

interface CommunitiesProps {
  currentUser: { id: string; username: string } | null;
}

const Communities: React.FC<CommunitiesProps> = ({ currentUser }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchCommunities();
      fetchUserCommunities();
    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [currentUser]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCommunities();
      setCommunities(data);
    } catch (err: any) {
      console.error('Error fetching communities:', err);
      setError(err.message || 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const data = await api.getUserCommunities();
      setUserCommunities(data);
    } catch (err: any) {
      console.error('Error fetching user communities:', err);
    }
  };

  const joinCommunity = async (communityId: number) => {
    try {
      setActionLoading(communityId);
      setError(null);
      await api.joinCommunity(communityId);
      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
    } catch (err: any) {
      console.error('Error joining community:', err);
      setError(err.message || 'Failed to join community');
    } finally {
      setActionLoading(null);
    }
  };

  const leaveCommunity = async (communityId: number) => {
    try {
      setActionLoading(communityId);
      setError(null);
      await api.leaveCommunity(communityId);
      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
    } catch (err: any) {
      console.error('Error leaving community:', err);
      setError(err.message || 'Failed to leave community');
    } finally {
      setActionLoading(null);
    }
  };

  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(-1);
      setError(null);
      await api.createCommunity(newCommunity);
      setShowCreateModal(false);
      setNewCommunity({ name: '', description: '', category: '' });
      await Promise.all([fetchCommunities(), fetchUserCommunities()]);
    } catch (err: any) {
      console.error('Error creating community:', err);
      setError(err.message || 'Failed to create community');
    } finally {
      setActionLoading(null);
    }
  };

  const isUserMember = (communityId: number) => {
    return userCommunities.some(community => community.id === communityId);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-red-500">Please log in to access communities</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading communities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">Communities</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Join communities of interest and achieve goals together!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">×</button>
          </div>
        )}

        {userCommunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-brand-secondary mb-4">My Communities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities.map(community => (
                <div key={community.id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-brand-primary/20">
                  <h3 className="text-xl font-bold text-brand-primary mb-2">{community.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{community.description}</p>
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>👥 {community.members_count} members</span>
                    <span>🎯 {community.habits_count} habits</span>
                  </div>
                  <button
                    onClick={() => leaveCommunity(community.id)}
                    disabled={actionLoading === community.id}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      actionLoading === community.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {actionLoading === community.id ? 'Leaving...' : 'Leave Community'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-brand-secondary">All Communities</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Create Community
            </button>
          </div>
          
          {communities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No communities found. Be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map(community => (
                <div key={community.id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{community.name}</h3>
                    <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-1 rounded-full">
                      {community.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{community.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>👥 {community.members_count}</span>
                      <span>🎯 {community.habits_count}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => isUserMember(community.id) ? leaveCommunity(community.id) : joinCommunity(community.id)}
                    disabled={actionLoading === community.id}
                    className={`w-full py-2 rounded-lg transition-colors ${
                      actionLoading === community.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isUserMember(community.id)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-brand-primary text-white hover:bg-brand-secondary'
                    }`}
                  >
                    {actionLoading === community.id 
                      ? 'Processing...' 
                      : isUserMember(community.id) 
                        ? 'Leave Community' 
                        : 'Join Community'
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-brand-primary mb-4">Create Community</h3>
              <form onSubmit={createCommunity}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      required
                      minLength={10}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity({...newCommunity, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Health">Health</option>
                      <option value="Sports">Sports</option>
                      <option value="Education">Education</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Creativity">Creativity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    disabled={actionLoading === -1}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      actionLoading === -1
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-brand-primary text-white hover:bg-brand-secondary'
                    }`}
                  >
                    {actionLoading === -1 ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;