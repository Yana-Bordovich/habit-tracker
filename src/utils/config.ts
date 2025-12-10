// App configuration
export const config = {
  API_URL: 'http://localhost:3001',
  APP_VERSION: '1.0.0',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
};

export const API_URL = config.API_URL;
