import React from 'react';
import { View, StyleSheet } from 'react-native';

export function SkeletonLoading() {
  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <View style={styles.largeBlock} />
      <View style={styles.row}>
        <View style={styles.halfBlock} />
        <View style={styles.halfBlock} />
      </View>
      <View style={styles.mediumBlock} />
      <View style={styles.row}>
        <View style={styles.thirdBlock} />
        <View style={styles.thirdBlock} />
        <View style={styles.thirdBlock} />
      </View>
      <View style={styles.row}>
        <View style={styles.circle} />
        <View style={styles.textLine} />
      </View>
      <View style={styles.row}>
        <View style={styles.circle} />
        <View style={styles.textLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    width: '100%',
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 20,
  },
  largeBlock: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 20,
  },
  mediumBlock: {
    width: '100%',
    height: 150,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  halfBlock: {
    width: '48%',
    height: 120,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  thirdBlock: {
    width: '30%',
    height: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e5e7eb',
  },
  textLine: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 15,
  },
});
