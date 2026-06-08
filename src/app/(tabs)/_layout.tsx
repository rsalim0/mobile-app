import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Font } from '@/constants/wordwise';
import { useThemeColors } from '@/context/theme';

export default function TabsLayout() {
  const WW = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WW.primary,
        tabBarInactiveTintColor: WW.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontFamily: Font.semibold, fontSize: 11 },
        tabBarItemStyle: { paddingVertical: 8 },
        // Floating, rounded "pill" bar inset from the screen edges (iOS style).
        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Math.max(insets.bottom, 14),
          height: 66,
          borderRadius: 33,
          backgroundColor: WW.card,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: WW.cardBorder,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 14,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
