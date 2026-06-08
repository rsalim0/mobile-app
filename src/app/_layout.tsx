import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
  useFonts,
} from '@expo-google-fonts/lora';
import { StatusBar } from 'expo-status-bar';
import { Drawer } from 'expo-router/drawer';
import type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DrawerContent } from '@/components/drawer-content';
import { FavoritesProvider } from '@/context/favorites';
import { SearchHistoryProvider } from '@/context/search-history';
import { ThemeProvider, useTheme } from '@/context/theme';

// Expo Router renders this on any uncaught render error anywhere in the app.
export { AppErrorBoundary as ErrorBoundary } from '@/components/error-boundary';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    InstrumentSerif_400Regular,
  });

  // Hold the (already-visible) splash until the font is ready.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SearchHistoryProvider>
          <FavoritesProvider>
            <RootNavigator />
          </FavoritesProvider>
        </SearchHistoryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** The drawer lives inside ThemeProvider so its colors track the theme. */
function RootNavigator() {
  const { colors, scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Drawer
        drawerContent={(props: DrawerContentComponentProps) => (
          <DrawerContent {...props} />
        )}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: { width: 320, backgroundColor: colors.bg },
          sceneStyle: { backgroundColor: colors.bg },
        }}>
        <Drawer.Screen name="(tabs)" />
        <Drawer.Screen name="word/[word]" />
      </Drawer>
    </>
  );
}
