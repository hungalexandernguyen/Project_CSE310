import { useState, useEffect, useRef } from 'react';
import { Pedometer, Magnetometer } from 'expo-sensors';
import { FloorLevel, IndoorNode } from '../utils/indoor_graph';

export interface UserPosition {
  x: number;
  y: number;
  floor: FloorLevel;
  heading: number; // degrees (0 = North/Up)
  isAtStairs?: boolean;
  progressPercent?: number;
}

const STEP_PIXELS = 22;           // ~1 bước đi bộ = 22px trên bản đồ
const STAIR_STEPS_PER_FLOOR = 18; // ~18 bước cho mỗi tầng cầu thang

interface RouteSegment {
  fromNode: IndoorNode;
  toNode: IndoorNode;
  length: number;           // pixels
  isStairsTransition: boolean;
}

export function useIndoorTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<UserPosition | null>(null);

  const stepCountRef = useRef(0);
  const headingRef = useRef(0);
  const routeRef = useRef<IndoorNode[]>([]);
  const segmentsRef = useRef<RouteSegment[]>([]);
  const totalLengthRef = useRef(0);
  const distanceTraveledRef = useRef(0);

  // ── 1. Bắt đầu theo dõi (khi bấm Find Route hoặc chọn điểm bắt đầu) ──
  const startTracking = (
    initialPos: Omit<UserPosition, 'heading'>,
    route?: IndoorNode[]
  ) => {
    stepCountRef.current = 0;
    distanceTraveledRef.current = 0;

    if (route && route.length >= 2) {
      routeRef.current = route;
      const segs: RouteSegment[] = [];
      let total = 0;

      for (let i = 0; i < route.length - 1; i++) {
        const n1 = route[i];
        const n2 = route[i + 1];
        const isStairs = n1.floor !== n2.floor;
        const len = isStairs
          ? STAIR_STEPS_PER_FLOOR * STEP_PIXELS
          : Math.hypot(n2.x - n1.x, n2.y - n1.y);

        segs.push({
          fromNode: n1,
          toNode: n2,
          length: len,
          isStairsTransition: isStairs,
        });
        total += len;
      }

      segmentsRef.current = segs;
      totalLengthRef.current = total;
    } else {
      routeRef.current = [];
      segmentsRef.current = [];
      totalLengthRef.current = 0;
    }

    setCurrentPosition({
      ...initialPos,
      heading: headingRef.current,
      isAtStairs: false,
      progressPercent: 0,
    });
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setCurrentPosition(null);
    routeRef.current = [];
    segmentsRef.current = [];
    distanceTraveledRef.current = 0;
  };

  // ── 2. Đăng ký cảm biến (Magnetometer + Pedometer) ─────────────
  useEffect(() => {
    if (!isTracking) return;

    let pedometerSub: any;
    let magnetoSub: any;

    const subscribe = async () => {
      // A. Compass / Magnetometer
      Magnetometer.setUpdateInterval(400);
      magnetoSub = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI) - 90;
        if (angle < 0) angle += 360;
        headingRef.current = angle;

        setCurrentPosition((prev) => (prev ? { ...prev, heading: angle } : null));
      });

      // B. Pedometer (Đếm bước chân)
      const isPedometerAvailable = await Pedometer.isAvailableAsync();
      if (!isPedometerAvailable) {
        console.warn('[IndoorTracker] Pedometer not available on this device');
      }

      pedometerSub = Pedometer.watchStepCount((result) => {
        const newSteps = result.steps;
        const diff = newSteps - stepCountRef.current;

        if (diff > 0) {
          stepCountRef.current = newSteps;
          const addedDist = diff * STEP_PIXELS;

          // ── Trường hợp 1: Có Route -> Bám theo lộ trình & Khóa cầu thang ──
          if (segmentsRef.current.length > 0 && totalLengthRef.current > 0) {
            distanceTraveledRef.current = Math.min(
              totalLengthRef.current,
              distanceTraveledRef.current + addedDist
            );

            const currDist = distanceTraveledRef.current;
            let accum = 0;
            let targetPos: UserPosition | null = null;

            for (const seg of segmentsRef.current) {
              if (accum + seg.length >= currDist || seg === segmentsRef.current[segmentsRef.current.length - 1]) {
                const segDist = Math.max(0, currDist - accum);
                const t = seg.length > 0 ? Math.min(1, segDist / seg.length) : 0;

                if (seg.isStairsTransition) {
                  // Đang trong đoạn leo cầu thang -> Khóa (x, y) tại cầu thang
                  const isUpperHalf = t >= 0.5;
                  const currentFloorNode = isUpperHalf ? seg.toNode : seg.fromNode;
                  targetPos = {
                    x: currentFloorNode.x,
                    y: currentFloorNode.y,
                    floor: currentFloorNode.floor,
                    heading: headingRef.current,
                    isAtStairs: true,
                    progressPercent: Math.round((currDist / totalLengthRef.current) * 100),
                  };
                } else {
                  // Đi trên hành lang cùng một tầng -> Nội suy mượt mà (x, y)
                  const newX = seg.fromNode.x + t * (seg.toNode.x - seg.fromNode.x);
                  const newY = seg.fromNode.y + t * (seg.toNode.y - seg.fromNode.y);

                  targetPos = {
                    x: Math.round(newX),
                    y: Math.round(newY),
                    floor: seg.fromNode.floor,
                    heading: headingRef.current,
                    isAtStairs: false,
                    progressPercent: Math.round((currDist / totalLengthRef.current) * 100),
                  };
                }
                break;
              }
              accum += seg.length;
            }

            if (targetPos) {
              setCurrentPosition(targetPos);
            }
          } else {
            // ── Trường hợp 2: Đi tự do (Free-roam) ──
            setCurrentPosition((prev) => {
              if (!prev) return null;
              const rad = headingRef.current * (Math.PI / 180);
              const newX = prev.x + Math.sin(rad) * addedDist;
              const newY = prev.y - Math.cos(rad) * addedDist;
              return {
                ...prev,
                x: Math.round(newX),
                y: Math.round(newY),
                heading: headingRef.current,
              };
            });
          }
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
