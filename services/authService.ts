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

      const authUrl = 'https://accounts.google.com/v3/signin/accountchooser?client_id=39223075628-b8hsm0a8rgcp4c84ac3qspgkd1fffpc5.apps.googleusercontent.com&redirect_uri=https%3A%2F%2Flearningbases.com%2Fapi%2Fauth%2Fgoogle%2Fcallback&response_type=code&scope=profile+email&state=eyJyZXR1cm5UbyI6Imh0dHBzOi8vbGVhcm5pbmdiYXNlcy5jb20vIiwidGltZXN0YW1wIjoxNzYzNzM4ODIzNzEyfQ%3D%3D&dsh=S1544833645%3A1763738823924003&o2v=2&service=lso&flowName=GeneralOAuthFlow&opparams=%253F&continue=https%3A%2F%2Faccounts.google.com%2Fsignin%2Foauth%2Fconsent%3Fauthuser%3Dunknown%26part%3DAJi8hAMBE9V_GBjTe1fvkkSg4vapFBVzG4fSRy1pTSmDpJOqDlhLCAiU-cFLZxdUmtEl2Nsoqlcv7qKLiKcBAIJmz-cwDSU-Cqx95LV0D0VKIAj1kqgNmpPRVP2mb9R9Q8leJzV0HSdgKid-XJHQBJnEOExDizcpmcO8rgexMTuV3pxYj4o1PEppTeKPsRRcup_aZ5tVmRUQZOA6I1TMJMynWBzDz-iVfiutxybv4MAE0lw8lnFPLrTQEdDr1yBxA4lBxIXinVzND13jieqsG1wbozeRXSFXlMeBDZOBN7j9sNIizMKPbTAdeFKirUFdQxqzoM1QvzErqgHIqOza8m2kWcl2ai8eK3IRvgCwsN-k9vf4PsTr25Mt0UCmjaY-uG_XkJzqAvMHC6okwMbMmIhydv4qBSesR4gsA15jVWZV0lDaqMavSuqITu-dvMrBDqNTbgYEQFiWHifUgfseSdXU7G8DOj72_w%26flowName%3DGeneralOAuthFlow%26as%3DS1544833645%253A1763738823924003%26client_id%3D39223075628-b8hsm0a8rgcp4c84ac3qspgkd1fffpc5.apps.googleusercontent.com%26requestPath%3D%252Fsignin%252Foauth%252Fconsent%23&app_domain=https%3A%2F%2Flearningbases.com'

      console.log(authUrl)

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const accessTokenMatch = url.match(/access_token=([^&]+)/);
        const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

        if (accessToken) {
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            return {
              id: userInfo.id,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            };
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
