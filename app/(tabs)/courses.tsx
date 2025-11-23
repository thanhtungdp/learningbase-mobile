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
      setCategories(categoriesData);
      setCourses(coursesData);
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
          <View style={styles.courseStats}>
            <View style={styles.statItem}>
              <BookOpen size={14} color="#6b7280" />
              <Text style={styles.statText}>{item.lessonsCount} lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Clock size={14} color="#6b7280" />
              <Text style={styles.statText}>{item.estimatedDuration} min</Text>
            </View>
            <View style={styles.statItem}>
              <BarChart size={14} color={getDifficultyColor(item.difficulty)} />
              <Text style={[styles.statText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>
          {item.isEnrolled && item.progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          )}
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
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#2563eb',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#fff',
  },
  coursesList: {
    padding: 20,
    gap: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  instructorName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    minWidth: 40,
    textAlign: 'right',
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
