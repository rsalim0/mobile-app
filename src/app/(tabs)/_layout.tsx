import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { Font } from '@/constants/wordwise';
import { useThemeColors } from '@/context/theme';

export default function TabsLayout() {
  const WW = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WW.primary,
        tabBarInactiveTintColor: WW.textMuted,
        tabBarStyle: {
          backgroundColor: WW.bg,
          borderTopColor: WW.divider,
        },
        tabBarLabelStyle: { fontFamily: Font.semibold, fontSize: 12 },
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
