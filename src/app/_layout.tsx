import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router'; // Cần cái này để chạy các màn hình bên trong
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  // Đoạn code này chỉ đơn giản là tạo ra một "ngăn chứa" cho các màn hình
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Bản đồ EIU' }} />
    </Stack>
  );
}
