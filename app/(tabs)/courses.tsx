import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { courseService, CourseCategory, Course } from '@/services/courseService';
import { BookOpen, Clock, BarChart, Globe } from 'lucide-react-native';
import { CourseSkeletonLoading } from '@/components/CourseSkeletonLoading';

export default function CoursesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const [categoriesData, coursesData] = await Promise.all([
        courseService.getCategories(),
        courseService.getCourses(),
      ]);

      const categoryMap = new Map(categoriesData.map(cat => [cat.id, cat.name]));
      const coursesWithCategory = coursesData.map(course => ({
        ...course,
        categoryName: categoryMap.get(course.categoryId) || 'General',
      }));

      setCategories(categoriesData);
      setCourses(coursesWithCategory);
    } catch (err) {
      setError('Failed to load courses');
      console.error(err);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    loadData(true);
  };

  const filteredCourses = selectedCategory
    ? courses.filter((course) => course.categoryId === selectedCategory)
    : courses;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderCategoryItem = ({ item }: { item: CourseCategory | { id: 'all'; name: string; color: string } }) => {
    const isAll = item.id === 'all';
    const isActive = isAll ? selectedCategory === null : selectedCategory === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.categoryChip,
          isActive && styles.categoryChipActive,
        ]}
        onPress={() => setSelectedCategory(isAll ? null : (isActive ? null : item.id))}
      >
        {isAll ? (
          <Globe size={14} color={isActive ? '#fff' : '#6b7280'} />
        ) : (
          <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
        )}
        <Text
          style={[
            styles.categoryText,
            isActive && styles.categoryTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    const imageUrl = item.thumbnailUrl.startsWith('http')
      ? item.thumbnailUrl
      : `https://learningbases.com${item.thumbnailUrl}`;

    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => router.push(`/course/${item.slug}`)}
      >
        <Image source={{ uri: imageUrl }} style={styles.courseThumbnail} />
        <View style={styles.courseContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.instructorName} numberOfLines={1}>
            {item.instructor.firstName} {item.instructor.lastName}
          </Text>
          <Text style={styles.courseType}>
            {item.lessonsCount > 1 ? 'Series' : 'Class'} • {item.categoryName || 'General'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <CourseSkeletonLoading />;
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courses</Text>
        <Text style={styles.headerSubtitle}>{filteredCourses.length} courses available</Text>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          horizontal
          data={[{ id: 'all', name: 'All', color: '#6b7280' }, ...categories]}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.coursesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
            colors={['#2563eb']}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#71717a',
  },
  categoriesContainer: {
    backgroundColor: '#000',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#27272a',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
  },
  categoryTextActive: {
    color: '#fff',
  },
  coursesList: {
    padding: 20,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseThumbnail: {
    width: 120,
    height: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  courseContent: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
    gap: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 13,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  courseType: {
    fontSize: 13,
    color: '#71717a',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
