import React, { useState, useEffect } from 'react';
import * as api from '../api';

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  members_count: number;
  habits_count: number;
  created_at: string;
  joined_at?: string;
  is_creator?: boolean;
}

interface CommunityMember {
  username: string;
  level: number;
  experience: number;
  joined_at: string;
}

interface CommunitiesProps {
  currentUser: { id: string; username: string } | null;
}

const Communities: React.FC<CommunitiesProps> = ({ currentUser }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommunityDetail, setShowCommunityDetail] = useState<Community | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Community | null>(null);
  const [communityMembers, setCommunityMembers] = useState<CommunityMember[]>([]);
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

  const fetchCommunityMembers = async (communityId: number) => {
    try {
      const members = await api.getCommunityMembers(communityId);
      setCommunityMembers(members);
    } catch (err: any) {
      console.error('Error fetching community members:', err);
    }
  };

  const joinCommunity = async (communityId: number) => {
    try {
      setActionLoading(communityId);
      setError(null);
      await api.joinCommunity(communityId);
      
      // Обновляем все данные
      await Promise.all([
        fetchCommunities(),
        fetchUserCommunities()
      ]);
      
      // Если открыто модальное окно этого сообщества, обновляем участников
      if (showCommunityDetail?.id === communityId) {
        await fetchCommunityMembers(communityId);
      }
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
      
      // Обновляем все данные
      await Promise.all([
        fetchCommunities(),
        fetchUserCommunities()
      ]);
      
      // Если открыто модальное окно этого сообщества, обновляем участников
      if (showCommunityDetail?.id === communityId) {
        await fetchCommunityMembers(communityId);
      }
      
      // Если вышли из текущего просматриваемого сообщества, закрываем детали
      if (showCommunityDetail?.id === communityId) {
        setShowCommunityDetail(null);
      }
    } catch (err: any) {
      console.error('Error leaving community:', err);
      setError(err.message || 'Failed to leave community');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteCommunity = async (communityId: number) => {
    try {
      setActionLoading(communityId);
      setError(null);
      await api.deleteCommunity(communityId);
      
      // Обновляем списки
      await Promise.all([
        fetchCommunities(),
        fetchUserCommunities()
      ]);
      
      // Закрываем модальные окна если нужно
      if (showCommunityDetail?.id === communityId) {
        setShowCommunityDetail(null);
      }
      setShowDeleteConfirm(null);
      
    } catch (err: any) {
      console.error('Error deleting community:', err);
      setError(err.message || 'Failed to delete community');
    } finally {
      setActionLoading(null);
    }
  };

  const createCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(-1);
      setError(null);
      const newCommunityData = await api.createCommunity(newCommunity);
      setShowCreateModal(false);
      setNewCommunity({ name: '', description: '', category: '' });
      
      // Обновляем списки сообществ
      await Promise.all([
        fetchCommunities(),
        fetchUserCommunities()
      ]);
      
      // Автоматически открываем детали созданного сообщества
      if (newCommunityData) {
        showCommunityDetails(newCommunityData);
      }
    } catch (err: any) {
      console.error('Error creating community:', err);
      setError(err.message || 'Failed to create community');
    } finally {
      setActionLoading(null);
    }
  };

  const showCommunityDetails = async (community: Community) => {
    setShowCommunityDetail(community);
    await fetchCommunityMembers(community.id);
  };

  const isUserMember = (communityId: number) => {
    return userCommunities.some(community => community.id === communityId);
  };

  const isUserCreator = (community: Community) => {
    return community.is_creator || communityMembers.some(member => 
      member.username === currentUser?.username && community.members_count === 1
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Health': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Sports': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Productivity': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Creativity': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'Other': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors['Other'];
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-red-500">Пожалуйста, войдите в систему для доступа к сообществам</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Загрузка сообществ...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brand-primary mb-4">Сообщества</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Присоединяйтесь к сообществам по интересам и достигайте целей вместе!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">×</button>
          </div>
        )}

        {/* User's Communities */}
        {userCommunities.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-brand-secondary">Мои сообщества</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {userCommunities.length} сообществ
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCommunities.map(community => (
                <div 
                  key={community.id} 
                  className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border border-brand-primary/20 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => showCommunityDetails(community)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-brand-primary">{community.name}</h3>
                      {isUserCreator(community) && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1 inline-block">
                          Создатель
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(community.category)}`}>
                      {community.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{community.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Участники:</span>
                      <span className="font-medium">👥 {community.members_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Привычки:</span>
                      <span className="font-medium">🎯 {community.habits_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Вы с:</span>
                      <span className="font-medium">{formatDate(community.joined_at!)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showCommunityDetails(community);
                      }}
                      className="flex-1 bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-secondary transition-colors"
                    >
                      Подробнее
                    </button>
                    {isUserCreator(community) ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(community);
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Удалить сообщество"
                      >
                        🗑️
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          leaveCommunity(community.id);
                        }}
                        disabled={actionLoading === community.id}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          actionLoading === community.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {actionLoading === community.id ? '...' : 'Выйти'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Communities */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-secondary">Все сообщества</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {communities.length} сообществ доступно
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-secondary transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Создать сообщество</span>
            </button>
          </div>
          
          {communities.length === 0 ? (
            <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-xl">
              <div className="text-6xl mb-4">🏘️</div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Сообществ пока нет</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Будьте первым, кто создаст сообщество!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-brand-primary text-white px-6 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Создать сообщество
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map(community => (
                <div 
                  key={community.id} 
                  className={`bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 shadow-lg border transition-all cursor-pointer ${
                    isUserMember(community.id) 
                      ? 'border-brand-primary/30 hover:border-brand-primary/50' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-brand-primary/30'
                  }`}
                  onClick={() => showCommunityDetails(community)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">{community.name}</h3>
                      {isUserCreator(community) && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1 inline-block">
                          Ваше сообщество
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(community.category)}`}>
                      {community.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{community.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Участники:</span>
                      <span className="font-medium">👥 {community.members_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Привычки:</span>
                      <span className="font-medium">🎯 {community.habits_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Создано:</span>
                      <span className="font-medium">{formatDate(community.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        isUserMember(community.id) ? leaveCommunity(community.id) : joinCommunity(community.id);
                      }}
                      disabled={actionLoading === community.id}
                      className={`flex-1 py-2 rounded-lg transition-colors font-medium ${
                        actionLoading === community.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isUserMember(community.id)
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-brand-primary text-white hover:bg-brand-secondary'
                      }`}
                    >
                      {actionLoading === community.id 
                        ? '...' 
                        : isUserMember(community.id) 
                          ? 'Покинуть' 
                          : 'Присоединиться'
                      }
                    </button>
                    
                    {isUserCreator(community) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(community);
                        }}
                        disabled={actionLoading === community.id}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          actionLoading === community.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                        title="Удалить сообщество"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Community Detail Modal */}
        {showCommunityDetail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-brand-primary">{showCommunityDetail.name}</h3>
                    {isUserCreator(showCommunityDetail) && (
                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1 inline-block">
                        Вы создатель этого сообщества
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCommunityDetail(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Описание</h4>
                    <p className="text-gray-600 dark:text-gray-400">{showCommunityDetail.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Категория:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(showCommunityDetail.category)}`}>
                        {showCommunityDetail.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Участники:</span>
                      <span className="font-medium">👥 {showCommunityDetail.members_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Привычки:</span>
                      <span className="font-medium">🎯 {showCommunityDetail.habits_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Создано:</span>
                      <span className="font-medium">{formatDate(showCommunityDetail.created_at)}</span>
                    </div>
                    {isUserMember(showCommunityDetail.id) && showCommunityDetail.joined_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Вы с:</span>
                        <span className="font-medium">{formatDate(showCommunityDetail.joined_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Community Members */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Участники сообщества</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {communityMembers.length} участников
                    </span>
                  </div>
                  
                  {communityMembers.length > 0 ? (
                    <div className="space-y-2">
                      {communityMembers.map((member, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center p-3 rounded-lg ${
                            member.username === currentUser.username
                              ? 'bg-brand-primary/10 border border-brand-primary/20'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">
                              {member.username}
                              {member.username === currentUser.username && (
                                <span className="ml-2 text-xs bg-brand-primary text-white px-2 py-1 rounded-full">
                                  Вы
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Уровень {member.level}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            с {formatDate(member.joined_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-4xl mb-2">👥</div>
                      <p className="text-gray-500 dark:text-gray-400 mb-2">Пока нет участников</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Станьте первым участником этого сообщества!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  {isUserCreator(showCommunityDetail) ? (
                    <>
                      <button
                        onClick={() => setShowDeleteConfirm(showCommunityDetail)}
                        disabled={actionLoading === showCommunityDetail.id}
                        className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                          actionLoading === showCommunityDetail.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {actionLoading === showCommunityDetail.id ? '...' : 'Удалить сообщество'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        if (isUserMember(showCommunityDetail.id)) {
                          leaveCommunity(showCommunityDetail.id);
                        } else {
                          joinCommunity(showCommunityDetail.id);
                        }
                      }}
                      disabled={actionLoading === showCommunityDetail.id}
                      className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                        actionLoading === showCommunityDetail.id
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isUserMember(showCommunityDetail.id)
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-brand-primary text-white hover:bg-brand-secondary'
                      }`}
                    >
                      {actionLoading === showCommunityDetail.id 
                        ? '...' 
                        : isUserMember(showCommunityDetail.id) 
                          ? 'Покинуть сообщество' 
                          : 'Присоединиться'
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-red-600 mb-2">Удалить сообщество?</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Вы уверены, что хотите удалить сообщество <strong>"{showDeleteConfirm.name}"</strong>? 
                  Это действие нельзя отменить.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Все данные сообщества, включая участников и привычки, будут удалены.
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => deleteCommunity(showDeleteConfirm.id)}
                    disabled={actionLoading === showDeleteConfirm.id}
                    className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                      actionLoading === showDeleteConfirm.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-700 text-white'
                    }`}
                  >
                    {actionLoading === showDeleteConfirm.id ? 'Удаление...' : 'Да, удалить'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    disabled={actionLoading === showDeleteConfirm.id}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-brand-primary mb-4">Создать сообщество</h3>
              <form onSubmit={createCommunity}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Название сообщества
                    </label>
                    <input
                      type="text"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Введите название"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity({...newCommunity, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                      placeholder="Опишите цель и тематику сообщества"
                      required
                      minLength={10}
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Категория
                    </label>
                    <select
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity({...newCommunity, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Выберите категорию</option>
                      <option value="Health">Здоровье</option>
                      <option value="Sports">Спорт</option>
                      <option value="Education">Образование</option>
                      <option value="Productivity">Продуктивность</option>
                      <option value="Creativity">Творчество</option>
                      <option value="Other">Другое</option>
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
                    {actionLoading === -1 ? 'Создание...' : 'Создать сообщество'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Отмена
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