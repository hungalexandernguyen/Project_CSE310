import { useLocalSearchParams, Stack } from 'expo-router';
import React from 'react';
import IndoorMapScreen from '../screens/IndoorMapScreen';

export default function IndoorRoute() {
  const { buildingId } = useLocalSearchParams<{ buildingId: string }>();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <IndoorMapScreen buildingId={buildingId ?? 'B11'} />
    </>
  );
}
