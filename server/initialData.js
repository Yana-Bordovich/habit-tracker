function getInitialState() {
    return {
        user: {
            id: '',
            username: '',
            level: 1,
            experience: 0,
            created_at: new Date().toISOString()
        },
        habits: [],
        achievements: [{
                id: 'first_habit',
                name: 'Первая привычка',
                description: 'Создайте свою первую привычку',
                icon: '🎯',
                unlocked: false,
                progress: 0,
                target: 1
            },
            {
                id: 'three_day_streak',
                name: 'Трехдневная серия',
                description: 'Выполняйте привычку 3 дня подряд',
                icon: '🔥',
                unlocked: false,
                progress: 0,
                target: 3
            },
            {
                id: 'week_streak',
                name: 'Недельная серия',
                description: 'Выполняйте привычку 7 дней подряд',
                icon: '⭐',
                unlocked: false,
                progress: 0,
                target: 7
            }
        ],
        communities: [],
        selectedHabit: null,
        lastUpdated: new Date().toISOString(),
        xp: 0,
        level: 1,
        theme: 'dark',
        primaryColor: '#4F46E5',
        avatarUrl: null
    };
}

module.exports = { getInitialState };