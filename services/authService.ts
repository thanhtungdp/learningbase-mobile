import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const LOGIN_API_URL = 'https://learningbases.com/api/login';
const REGISTER_API_URL = 'https://learningbases.com/api/register';
const ORGANIZATION_ID = 'fb5f5a11-9cd2-43a8-964e-240c9ff9ea22';

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  cookie: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

const STORAGE_KEYS = {
  USER: '@learningbases/user',
  COOKIE: '@learningbases/cookie',
  LAST_URL: '@learningbases/last_url',
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://learningbases.com',
          'referer': 'https://learningbases.com/auth',
          'x-organization-id': ORGANIZATION_ID,
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user: User = await response.json();

      const setCookieHeader = response.headers.get('set-cookie');
      const cookie = setCookieHeader || '';

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.COOKIE, cookie);

      return { user, cookie };
    } catch (error) {
      throw error;
    }
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://learningbases.com',
          'referer': 'https://learningbases.com/auth',
          'x-organization-id': ORGANIZATION_ID,
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }

      const user: User = await response.json();

      const setCookieHeader = response.headers.get('set-cookie');
      const cookie = setCookieHeader || '';

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.COOKIE, cookie);
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_URL, 'https://learningbases.com/explore');

      return { user, cookie };
    } catch (error) {
      throw error;
    }
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.COOKIE);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_URL);
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  },

  async getStoredCookie(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.COOKIE);
    } catch {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getStoredUser();
    return user !== null;
  },

  async saveLastVisitedUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_URL, url);
    } catch {
      // Ignore error
    }
  },

  async getLastVisitedUrl(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_URL);
    } catch {
      return null;
    }
  },

  async loginWithGoogle(): Promise<GoogleUserInfo | null> {
    try {
      const GOOGLE_CLIENT_ID = '39223075628-b8hsm0a8rgcp4c84ac3qspgkd1fffpc5.apps.googleusercontent.com';
      const redirectUri = 'https://learningbases.com/api/auth/google/callback';

      const state = btoa(JSON.stringify({
        returnTo: 'https://learningbases.com/',
        timestamp: Date.now()
      }));

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('profile email')}&` +
        `state=${encodeURIComponent(state)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const codeMatch = url.match(/code=([^&]+)/);
        const code = codeMatch ? codeMatch[1] : null;

        if (code) {
          const response = await fetch(redirectUri, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();

            if (data.user) {
              return {
                id: data.user.id || data.user.googleId,
                email: data.user.email,
                name: data.user.name || `${data.user.firstName} ${data.user.lastName}`,
                picture: data.user.picture || data.user.avatar || '',
              };
            }
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Failed to login with Google');
    }
  },
};
