import { useState, useEffect, useRef } from 'react';
import { Pedometer, Magnetometer } from 'expo-sensors';
import { FloorLevel } from '../utils/indoor_graph';

export interface UserPosition {
  x: number;
  y: number;
  floor: FloorLevel;
  heading: number; // degrees
}

const STEP_PIXELS = 20; // 1 step = 20 pixels on SVG
const MAP_OFFSET_ANGLE = 0; // Map's rotation offset from True North

export function useIndoorTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<UserPosition | null>(null);
  
  const stepCountRef = useRef(0);
  const headingRef = useRef(0);
  const positionRef = useRef<UserPosition | null>(null);

  useEffect(() => {
    positionRef.current = currentPosition;
  }, [currentPosition]);

  const startTracking = (initialPos: Omit<UserPosition, 'heading'>) => {
    setCurrentPosition({ ...initialPos, heading: headingRef.current });
    setIsTracking(true);
    stepCountRef.current = 0;
  };

  const stopTracking = () => {
    setIsTracking(false);
    setCurrentPosition(null);
  };

  useEffect(() => {
    if (!isTracking) return;

    let pedometerSub: any;
    let magnetoSub: any;

    const subscribe = async () => {
      // Check Pedometer
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Pedometer not available on this device');
      }

      // Compass / Magnetometer
      Magnetometer.setUpdateInterval(500); // 500ms
      magnetoSub = Magnetometer.addListener((data) => {
        // Compute heading from magnetometer data
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = angle - 90;
        if (angle < 0) angle += 360;
        headingRef.current = angle;

        setCurrentPosition(prev => prev ? { ...prev, heading: angle } : null);
      });

      // Pedometer
      pedometerSub = Pedometer.watchStepCount((result) => {
        const newSteps = result.steps;
        const diff = newSteps - stepCountRef.current;
        
        if (diff > 0 && positionRef.current) {
          stepCountRef.current = newSteps;
          
          const pos = positionRef.current;
          const rad = (headingRef.current - MAP_OFFSET_ANGLE) * (Math.PI / 180);
          
          // Y negative is "North" (up) in SVG
          const newX = pos.x + Math.sin(rad) * STEP_PIXELS * diff;
          const newY = pos.y - Math.cos(rad) * STEP_PIXELS * diff;
          
          setCurrentPosition({ ...pos, x: newX, y: newY, heading: headingRef.current });
        }
      });
    };

    subscribe();

    return () => {
      if (pedometerSub) pedometerSub.remove();
      if (magnetoSub) magnetoSub.remove();
    };
  }, [isTracking]);

  return {
    isTracking,
    currentPosition,
    startTracking,
    stopTracking,
  };
}
