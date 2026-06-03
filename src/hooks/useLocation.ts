import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export type PermissionStatus = 'undetermined' | 'granted' | 'denied';

interface UseLocationResult {
  location: UserLocation | null;
  permissionStatus: PermissionStatus;
  requestPermission: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const startWatching = async () => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,     // update at most every 3 s
        distanceInterval: 2,    // or when moved ≥2 m
      },
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      }
    );
  };

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const mapped: PermissionStatus = status === 'granted' ? 'granted' : 'denied';
    setPermissionStatus(mapped);
    if (mapped === 'granted') {
      await startWatching();
    }
  };

  useEffect(() => {
    // Auto-request permission on mount — shows OS dialog if not yet decided
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const mapped: PermissionStatus = status === 'granted' ? 'granted' : 'denied';
      setPermissionStatus(mapped);
      if (mapped === 'granted') {
        await startWatching();
      }
    })();

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  return { location, permissionStatus, requestPermission };
}
