import React, { useState, useEffect } from 'react';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity, getUserCommunities, deleteCommunity } from '../api';

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<any[]>([]);
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: ''
  });
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
    fetchUserCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await getCommunities();
      setCommunities(data);
    } catch (err) {
      setError('Failed to fetch communities');
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const data = await getUserCommunities();
      setUserCommunities(data);
    } catch (err) {
      console.error('Error fetching user communities:', err);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const createdCommunity = await createCommunity(newCommunity);
      setCommunities(prev => [...prev, createdCommunity]);
      setNewCommunity({ name: '', description: '', category: '' });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to create community');
      console.error('Error creating community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
      await fetchCommunities();
      await fetchUserCommunities();
      setError(null);
    } catch (err) {
      setError('Failed to join community');
      console.error('Error joining community:', err);
    }
  };

  const handleLeaveCommunity = async (communityId: number) => {
    try {
      await leaveCommunity(communityId);
      await fetchCommunities();
      await fetchUserCommunities();
      setError(null);
    } catch (err) {
      setError('Failed to leave community');
      console.error('Error leaving community:', err);
    }
  };

  const handleDeleteCommunity = async (communityId: number) => {
    if (window.confirm('Are you sure you want to delete this community?')) {
      try {
        await deleteCommunity(communityId);
        setCommunities(prev => prev.filter(community => community.id !== communityId));
        setUserCommunities(prev => prev.filter(community => community.id !== communityId));
        setSelectedCommunity(null);
        setError(null);
      } catch (err) {
        setError('Failed to delete community');
        console.error('Error deleting community:', err);
      }
    }
  };

  const showCommunityDetails = (community: any) => {
    setSelectedCommunity(community);
  };

  const isUserMember = (communityId: number) => {
    return userCommunities.some(community => community.id === communityId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Communities</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Create Community
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Community</h2>
            <form onSubmit={handleCreateCommunity}>
              <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">
                  Description
                </label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-200 text-sm font-bold mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.map(community => (
          <div
            key={community.id}
            className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-700"
            onClick={() => showCommunityDetails(community)}
          >
            <h3 className="text-xl font-semibold text-white mb-2">
              {community.name}
            </h3>
            <p className="text-gray-300 mb-4 line-clamp-2">
              {community.description}
            </p>
            <div className="flex justify-between items-center mb-4">
              <span className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm">
                {community.category}
              </span>
              <span className="text-sm text-gray-400">
                {community.members_count} members
              </span>
            </div>
            <div className="flex justify-between items-center">
              {isUserMember(community.id) ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeaveCommunity(community.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Leave
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinCommunity(community.id);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Join
                </button>
              )}
              <span className="text-xs text-gray-500">
                {new Date(community.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {communities.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No communities found.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create the first community
          </button>
        </div>
      )}

      {selectedCommunity && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">
                {selectedCommunity.name}
              </h2>
              <button
                onClick={() => setSelectedCommunity(null)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-300 mb-4">{selectedCommunity.description}</p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-300">Category:</span>
                <span className="font-medium text-white">{selectedCommunity.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Members:</span>
                <span className="font-medium text-white">{selectedCommunity.members_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Created:</span>
                <span className="font-medium text-white">
                  {new Date(selectedCommunity.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              {isUserMember(selectedCommunity.id) ? (
                <button
                  onClick={() => handleLeaveCommunity(selectedCommunity.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Leave Community
                </button>
              ) : (
                <button
                  onClick={() => handleJoinCommunity(selectedCommunity.id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Join Community
                </button>
              )}
              <button
                onClick={() => handleDeleteCommunity(selectedCommunity.id)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;