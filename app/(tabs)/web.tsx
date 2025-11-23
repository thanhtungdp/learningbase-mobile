import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { WebViewNavBar } from '@/components/WebViewNavBar';
import { SkeletonLoading } from '@/components/SkeletonLoading';
import { authService } from '@/services/authService';
import { Compass, LogOut, Info, Plus, UserCircle, Trash2 } from 'lucide-react-native';

const BASE_URL = 'https://learningbases.com';

export default function MainScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [cookie, setCookie] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [initialUrl, setInitialUrl] = useState<string>(BASE_URL);
  const [isLoading, setIsLoading] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadInitialData();
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  const loadInitialData = async () => {
    const storedCookie = await authService.getStoredCookie();
    setCookie(storedCookie);

    const lastUrl = await authService.getLastVisitedUrl();
    if (lastUrl) {
      setInitialUrl(lastUrl);
    }
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleHome = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${BASE_URL}';`);
    }
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleOptionsPress = () => {
    setShowOptionsMenu(true);
  };

  const handleLogout = () => {
    setShowOptionsMenu(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleInfo = () => {
    setShowOptionsMenu(false);
    Alert.alert('Info', 'LearningBases - Learning for Growth\nVersion 1.0.0');
  };

  const handleExplore = () => {
    setShowOptionsMenu(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${BASE_URL}/explore';`);
    }
  };

  const handleCreateCommunity = () => {
    setShowOptionsMenu(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${BASE_URL}/select-organization';`);
    }
  };

  const handleProfileSettings = () => {
    setShowOptionsMenu(false);
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.location.href = '${BASE_URL}/app/account/settings';`);
    }
  };

  const handleDeleteAccount = () => {
    setShowOptionsMenu(false);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'How to Delete Account',
              'To delete your account:\n\n1. Go to Profile Settings\n2. Scroll to the bottom\n3. Click "Delete Account"\n4. Confirm deletion\n\nOr contact support@learningbases.com',
              [{ text: 'OK' }]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const injectedJavaScript = cookie
    ? `
      (function() {
        document.cookie = "${cookie}";
      })();
      true;
    `
    : '';

  return (
    <View style={styles.container}>
      <WebViewNavBar
        canGoBack={canGoBack}
        onGoBack={handleGoBack}
        onHome={handleHome}
        onRefresh={handleRefresh}
        onOptionsPress={handleOptionsPress}
      />
      <View style={styles.webviewContainer}>
        <WebView
        ref={webViewRef}
        source={{ uri: initialUrl }}
        style={styles.webview}
        onLoadStart={() => {
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
          }
          setIsLoading(true);
        }}
        onLoadEnd={() => {
          loadingTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
          }, 1300);
        }}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
          if (navState.url) {
            authService.saveLastVisitedUrl(navState.url);
          }
        }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        domStorageEnabled={true}
        javaScriptEnabled={true}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <SkeletonLoading />
          </View>
        )}
      </View>

      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsMenu(false)}
        >
          <View style={styles.optionsMenu}>
            <TouchableOpacity style={styles.optionItem} onPress={handleExplore}>
              <Compass size={20} color="#1f2937" />
              <Text style={styles.optionText}>Explore</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.optionItem} onPress={handleCreateCommunity}>
              <Plus size={20} color="#1f2937" />
              <Text style={styles.optionText}>Create Community</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.optionItem} onPress={handleProfileSettings}>
              <UserCircle size={20} color="#1f2937" />
              <Text style={styles.optionText}>Profile Settings</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.optionItem} onPress={handleInfo}>
              <Info size={20} color="#1f2937" />
              <Text style={styles.optionText}>Info</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.optionItem} onPress={handleDeleteAccount}>
              <Trash2 size={20} color="#dc2626" />
              <Text style={[styles.optionText, styles.deleteText]}>Delete Account</Text>
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
              <LogOut size={20} color="#dc2626" />
              <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    paddingBottom: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  optionsMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  logoutText: {
    color: '#dc2626',
  },
  deleteText: {
    color: '#dc2626',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
});
