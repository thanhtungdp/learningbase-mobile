import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_API_URL = 'https://learningbases.com/api';
const LOGIN_API_URL = `${BASE_API_URL}/login`;
const REGISTER_API_URL = `${BASE_API_URL}/register`;
const ENROLLMENT_API_URL = `${BASE_API_URL}/enrollments`;
const ORGANIZATIONS_API_URL = `${BASE_API_URL}/user/organizations`;
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

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  completedAt: string | null;
  progress: number;
  lastAccessedAt: string | null;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  status: string;
  joinedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string | null;
  description: string;
  logoUrl: string | null;
  contactEmail: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  isPublic: boolean;
  publicSlug: string;
  organizationType: string;
  createdAt: string;
  updatedAt: string;
  membership: OrganizationMembership;
}

const STORAGE_KEYS = {
  USER: '@learningbases/user',
  COOKIE: '@learningbases/cookie',
  LAST_URL: '@learningbases/last_url',
  ORGANIZATION_ID: '@learningbases/organization_id',
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

  async enrollCourse(courseId: string): Promise<Enrollment> {
    try {
      const cookie = await this.getStoredCookie();
      const orgId = await this.getStoredOrganizationId() || ORGANIZATION_ID;

      const response = await fetch(ENROLLMENT_API_URL, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://learningbases.com',
          'referer': `https://learningbases.com/app/courses/${courseId}`,
          'x-organization-id': orgId,
          'Cookie': cookie || '',
        },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error('Enrollment failed');
      }

      const enrollment: Enrollment = await response.json();
      return enrollment;
    } catch (error) {
      throw error;
    }
  },

  async saveOrganizationId(organizationId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, organizationId);
    } catch {
      // Ignore error
    }
  },

  async getStoredOrganizationId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ORGANIZATION_ID);
    } catch {
      return null;
    }
  },

  async getUserOrganizations(): Promise<Organization[]> {
    try {
      const cookie = await this.getStoredCookie();
      const orgId = await this.getStoredOrganizationId() || ORGANIZATION_ID;

      const response = await fetch(ORGANIZATIONS_API_URL, {
        headers: {
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'x-organization-id': orgId,
          'Cookie': cookie || '',
        },
      });

      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to fetch organizations');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },
};
