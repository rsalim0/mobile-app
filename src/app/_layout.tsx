import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
  useFonts,
} from '@expo-google-fonts/lora';
import { Drawer } from 'expo-router/drawer';
import type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DrawerContent } from '@/components/drawer-content';
import { FavoritesProvider } from '@/context/favorites';
import { SearchHistoryProvider } from '@/context/search-history';
import { WW } from '@/constants/wordwise';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    InstrumentSerif_400Regular,
  });

  // Hold the (already-visible) splash until the font is ready to avoid a
  // flash of the system font.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SearchHistoryProvider>
        <FavoritesProvider>
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
        </FavoritesProvider>
      </SearchHistoryProvider>
    </GestureHandlerRootView>
  );
}
