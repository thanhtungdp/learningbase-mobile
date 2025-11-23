import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, SafeAreaView } from 'react-native';

export const CourseDetailSkeleton = () => {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Animated.View style={[styles.backButton, { opacity }]} />
        <Animated.View style={[styles.headerTitle, { opacity }]} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.thumbnail, { opacity }]} />

        <View style={styles.infoCard}>
          <Animated.View style={[styles.title, { opacity, width: '90%' }]} />
          <Animated.View style={[styles.title, { opacity, width: '60%', height: 20 }]} />

          <View style={styles.instructorRow}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <View>
              <Animated.View style={[styles.smallText, { opacity, width: 60 }]} />
              <Animated.View style={[styles.mediumText, { opacity, width: 120 }]} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <Animated.View key={i} style={[styles.statBox, { opacity }]}>
                <Animated.View style={[styles.statIcon, { opacity }]} />
                <Animated.View style={[styles.statValue, { opacity }]} />
                <Animated.View style={[styles.statLabel, { opacity }]} />
              </Animated.View>
            ))}
          </View>

          <Animated.View style={[styles.sectionTitle, { opacity }]} />
          <Animated.View style={[styles.descLine, { opacity, width: '100%' }]} />
          <Animated.View style={[styles.descLine, { opacity, width: '95%' }]} />
          <Animated.View style={[styles.descLine, { opacity, width: '80%' }]} />

          <Animated.View style={[styles.sectionTitle, { opacity, marginTop: 24 }]} />
          <Animated.View style={[styles.smallText, { opacity, width: 150 }]} />

          {[1, 2, 3].map((i) => (
            <Animated.View key={i} style={[styles.sectionCard, { opacity }]}>
              <View style={styles.sectionHeader}>
                <Animated.View style={[styles.sectionNumber, { opacity }]} />
                <View style={styles.sectionInfo}>
                  <Animated.View style={[styles.mediumText, { opacity, width: 180 }]} />
                  <Animated.View style={[styles.smallText, { opacity, width: 120 }]} />
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  headerTitle: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
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
  title: {
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 8,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
  },
  smallText: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
  },
  mediumText: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
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
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  statValue: {
    width: 40,
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  statLabel: {
    width: 50,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  sectionTitle: {
    height: 24,
    width: 180,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 12,
  },
  descLine: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
  },
  sectionInfo: {
    flex: 1,
  },
});
