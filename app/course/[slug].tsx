import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { courseService, CourseDetail } from '@/services/courseService';
import { ArrowLeft, Clock, BookOpen, BarChart, Users, ChevronDown, ChevronUp } from 'lucide-react-native';
import { CourseDetailSkeleton } from '@/components/CourseDetailSkeleton';

export default function CourseDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (slug) {
      loadCourseDetail();
    }
  }, [slug]);

  const loadCourseDetail = async () => {
    try {
      setLoading(true);
      const data = await courseService.getCourseDetail(slug);
      setCourse(data);
      if (data.sections.length > 0) {
        setExpandedSections(new Set([data.sections[0].id]));
      }
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

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

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (error || !course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Course not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageUrl = course.thumbnailUrl.startsWith('http')
    ? course.thumbnailUrl
    : `https://learningbases.com${course.thumbnailUrl}`;

  const instructorImageUrl = course.instructor.profileImageUrl.startsWith('http')
    ? course.instructor.profileImageUrl
    : `https://learningbases.com${course.instructor.profileImageUrl}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Course Details
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: imageUrl }} style={styles.thumbnail} />

        <View style={styles.infoCard}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{course.title}</Text>
            {course.isPremiumOnly && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>

          <View style={styles.instructorRow}>
            <Image source={{ uri: instructorImageUrl }} style={styles.instructorAvatar} />
            <View>
              <Text style={styles.instructorLabel}>Instructor</Text>
              <Text style={styles.instructorName}>
                {course.instructor.firstName} {course.instructor.lastName}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <BookOpen size={20} color="#2563eb" />
              <Text style={styles.statValue}>{course.lessonsCount}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
            <View style={styles.statBox}>
              <Clock size={20} color="#2563eb" />
              <Text style={styles.statValue}>{course.estimatedDuration}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statBox}>
              <BarChart size={20} color={getDifficultyColor(course.difficulty)} />
              <Text style={[styles.statValue, { color: getDifficultyColor(course.difficulty) }]}>
                {course.difficulty}
              </Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statBox}>
              <Users size={20} color="#2563eb" />
              <Text style={styles.statValue}>{course.enrollmentCount}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>

          {course.isEnrolled && course.progress !== undefined && (
            <View style={styles.enrolledContainer}>
              <View style={styles.enrolledHeader}>
                <Text style={styles.enrolledText}>Your Progress</Text>
                <Text style={styles.progressPercentage}>{course.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
              </View>
            </View>
          )}

          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.description}>{stripHtml(course.description)}</Text>

          <Text style={styles.sectionTitle}>Course Content</Text>
          <Text style={styles.sectionsSubtitle}>
            {course.sectionsCount} sections • {course.lessonsCount} lessons
          </Text>

          {course.sections.map((section, index) => (
            <View key={section.id} style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
              >
                <View style={styles.sectionHeaderLeft}>
                  <View style={styles.sectionNumber}>
                    <Text style={styles.sectionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.sectionInfo}>
                    <Text style={styles.sectionTitleText}>{section.title}</Text>
                    {section.description && (
                      <Text style={styles.sectionDescription} numberOfLines={2}>
                        {stripHtml(section.description)}
                      </Text>
                    )}
                  </View>
                </View>
                {expandedSections.has(section.id) ? (
                  <ChevronUp size={20} color="#6b7280" />
                ) : (
                  <ChevronDown size={20} color="#6b7280" />
                )}
              </TouchableOpacity>

              {expandedSections.has(section.id) && section.description && (
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionFullDescription}>
                    {stripHtml(section.description)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.enrollButton}
          onPress={() => router.push(`/learn/${slug}`)}
        >
          <Text style={styles.enrollButtonText}>
            {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  thumbnail: {
    width: '100%',
    height: 240,
    backgroundColor: '#e5e7eb',
  },
  infoCard: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  premiumBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  instructorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  enrolledContainer: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  enrolledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  enrolledText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionsSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  sectionInfo: {
    flex: 1,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 60,
  },
  sectionFullDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  enrollButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
