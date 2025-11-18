import { useState, useCallback } from "react";
import { calculateZoomFromRadius } from "@/utils/map-helpers";

interface UseMapCameraReturn {
  currentZoom: number;
  setZoomFromRadius: (radius: number, latitude: number) => void;
  setCurrentZoom: (zoom: number) => void;
}

export function useMapCamera(
  initialRadius: number,
  initialLatitude?: number
): UseMapCameraReturn {
  const [currentZoom, setCurrentZoom] = useState<number>(() => {
    if (initialLatitude !== undefined) {
      return calculateZoomFromRadius(initialRadius, initialLatitude);
    }
    return 13; // Default zoom
  });

  const setZoomFromRadius = useCallback(
    (radius: number, latitude: number) => {
      const newZoom = calculateZoomFromRadius(radius, latitude);
      setCurrentZoom(newZoom);
    },
    []
  );

  return {
    currentZoom,
    setZoomFromRadius,
    setCurrentZoom,
  };
}

