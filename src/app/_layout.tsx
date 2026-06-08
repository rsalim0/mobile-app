import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Drawer } from 'expo-router/drawer';
import type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DrawerContent } from '@/components/drawer-content';
import { SearchHistoryProvider } from '@/context/search-history';
import { WW } from '@/constants/wordwise';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Hold the (already-visible) splash until the font is ready to avoid a
  // flash of the system font.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SearchHistoryProvider>
        <Drawer
          drawerContent={(props: DrawerContentComponentProps) => (
            <DrawerContent {...props} />
          )}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            drawerStyle: { width: 320, backgroundColor: WW.bg },
            sceneStyle: { backgroundColor: WW.bg },
          }}>
          <Drawer.Screen name="index" />
          <Drawer.Screen name="word/[word]" />
        </Drawer>
      </SearchHistoryProvider>
    </GestureHandlerRootView>
  );
}
