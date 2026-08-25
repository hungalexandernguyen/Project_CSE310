import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router'; // Cần cái này để chạy các màn hình bên trong
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  // Đoạn code này chỉ đơn giản là tạo ra một "ngăn chứa" cho các màn hình
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="indoor" options={{ headerShown: true }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
