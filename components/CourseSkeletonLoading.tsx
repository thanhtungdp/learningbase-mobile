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
        <Animated.View style={[styles.titleLine, { opacity, width: '90%' }]} />
        <Animated.View style={[styles.subtitleLine, { opacity, width: '50%' }]} />
        <Animated.View style={[styles.typeLine, { opacity, width: '60%' }]} />
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
        {[1, 2, 3, 4, 5].map((i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#000',
  },
  headerTitle: {
    height: 32,
    width: 150,
    backgroundColor: '#27272a',
    borderRadius: 6,
    marginBottom: 8,
  },
  headerSubtitle: {
    height: 16,
    width: 180,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: '#000',
  },
  categoryChip: {
    height: 32,
    width: 90,
    backgroundColor: '#27272a',
    borderRadius: 16,
  },
  coursesList: {
    padding: 20,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  thumbnail: {
    width: 120,
    height: 100,
    backgroundColor: '#27272a',
    borderRadius: 8,
  },
  courseContent: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
    gap: 6,
  },
  titleLine: {
    height: 16,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
  subtitleLine: {
    height: 13,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
  typeLine: {
    height: 13,
    backgroundColor: '#27272a',
    borderRadius: 4,
  },
});
