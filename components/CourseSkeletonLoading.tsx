import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export const CourseSkeletonLoading = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const CategorySkeleton = () => (
    <View style={styles.categoryContainer}>
      {[1, 2, 3, 4].map((i) => (
        <Animated.View key={i} style={[styles.categoryChip, { opacity }]} />
      ))}
    </View>
  );

  const CourseCardSkeleton = () => (
    <View style={styles.courseCard}>
      <Animated.View style={[styles.thumbnail, { opacity }]} />
      <View style={styles.courseContent}>
        <Animated.View style={[styles.titleLine, { opacity, width: '80%' }]} />
        <Animated.View style={[styles.subtitleLine, { opacity, width: '40%' }]} />
        <View style={styles.statsRow}>
          <Animated.View style={[styles.statBox, { opacity }]} />
          <Animated.View style={[styles.statBox, { opacity }]} />
          <Animated.View style={[styles.statBox, { opacity }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.headerTitle, { opacity }]} />
        <Animated.View style={[styles.headerSubtitle, { opacity }]} />
      </View>

      <CategorySkeleton />

      <View style={styles.coursesList}>
        {[1, 2, 3].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    height: 32,
    width: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
  },
  headerSubtitle: {
    height: 16,
    width: 180,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryChip: {
    height: 32,
    width: 90,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
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
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e7eb',
  },
  courseContent: {
    padding: 16,
  },
  titleLine: {
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  subtitleLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    height: 14,
    width: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});
