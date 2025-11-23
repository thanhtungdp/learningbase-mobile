import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://learningbases.com/api';
const ORGANIZATION_ID = 'd4e9122a-10bc-4050-ba11-7d05b7a87d8e';

export interface CourseCategory {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  thumbnailUrl: string;
  estimatedDuration: number;
  difficulty: string;
  isPublished: boolean;
  status: string;
  isPremiumOnly: boolean;
  createdAt: string;
  updatedAt: string;
  instructor: Instructor;
  lessonsCount: number;
  sectionsCount: number;
  isEnrolled?: boolean;
  progress?: number;
  lastAccessedAt?: string | null;
  enrolledAt?: string | null;
  completedAt?: string | null;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseDetail extends Course {
  enrollmentCount: number;
  instructorStats: {
    totalCourses: number;
    totalEnrollments: number;
  };
  sections: CourseSection[];
}

export const courseService = {
  async getCategories(): Promise<CourseCategory[]> {
    try {
      const cookie = await AsyncStorage.getItem('userCookie');

      const response = await fetch(
        `${BASE_URL}/organizations/${ORGANIZATION_ID}/course-categories`,
        {
          headers: {
            'accept': '*/*',
            'x-organization-id': ORGANIZATION_ID,
            ...(cookie ? { 'Cookie': cookie } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getCourses(): Promise<Course[]> {
    try {
      const cookie = await AsyncStorage.getItem('userCookie');

      const response = await fetch(`${BASE_URL}/courses`, {
        headers: {
          'accept': '*/*',
          'x-organization-id': ORGANIZATION_ID,
          ...(cookie ? { 'Cookie': cookie } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  async getCourseDetail(slug: string): Promise<CourseDetail> {
    try {
      const cookie = await AsyncStorage.getItem('userCookie');

      const response = await fetch(`${BASE_URL}/courses/${slug}`, {
        headers: {
          'accept': '*/*',
          'x-organization-id': ORGANIZATION_ID,
          ...(cookie ? { 'Cookie': cookie } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course detail');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching course detail:', error);
      throw error;
    }
  },
};
