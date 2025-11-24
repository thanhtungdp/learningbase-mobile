import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ChevronLeft, Home, RefreshCw, MoreVertical, Building2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface WebViewNavBarProps {
  canGoBack: boolean;
  onGoBack: () => void;
  onHome: () => void;
  onRefresh: () => void;
  onOptionsPress: () => void;
  onRouterBack?: () => void;
  onOrganizationPress?: () => void;
}

export function WebViewNavBar({
  canGoBack,
  onGoBack,
  onHome,
  onRefresh,
  onOptionsPress,
  onRouterBack,
  onOrganizationPress,
}: WebViewNavBarProps) {
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (canGoBack) {
      onGoBack();
    } else if (onRouterBack) {
      onRouterBack();
    }
  };

  return (
    <LinearGradient
      colors={['#2266E1', '#69F576']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.gradient, { paddingTop: insets.top - 16 }]}
    >
      <View style={styles.content}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleBackPress}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
           <Image
            source={require('@/assets/images/logo-inline_white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
         
        <View style={styles.rightActions}>
          {onOrganizationPress && (
            <TouchableOpacity style={styles.button} onPress={onOrganizationPress}>
              <Building2 size={22} color="#ffffff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.button} onPress={onRefresh}>
            <RefreshCw size={22} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
            <MoreVertical size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    height: 32,
    width: 120,
    marginRight: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  optionsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
