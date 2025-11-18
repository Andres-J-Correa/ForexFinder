import { useState, useCallback, useEffect } from "react";
import { Alert, Linking } from "react-native";
import * as Location from "expo-location";
import { handleError } from "@/utils/error-handler";

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  userLocation: UserLocation | null;
  latitude: string;
  longitude: string;
  locationPermission: boolean | null;
  locationLoading: boolean;
  requestLocationPermission: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  // Start with loading true to show feedback immediately on mount
  const [locationLoading, setLocationLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const getCurrentLocation = useCallback(async () => {
    try {
      setLocationLoading(true);

      // Check if permission is granted
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = location.coords.latitude;
      const lng = location.coords.longitude;

      setLatitude(lat.toString());
      setLongitude(lng.toString());
      setUserLocation({ latitude: lat, longitude: lng });
    } catch (error) {
      handleError(
        error,
        "useLocation.getCurrentLocation",
        "Failed to get current location"
      );
      Alert.alert("Error", "Failed to get your location. Please try again.");
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      setLocationLoading(true);

      // First check current permission status
      const { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();

      // If already granted, just get location
      if (currentStatus === "granted") {
        setLocationPermission(true);
        await getCurrentLocation();
        return;
      }

      // Request permission (this will show the dialog if not permanently denied)
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        await getCurrentLocation();
      } else {
        // Permission denied - guide user to settings
        Alert.alert(
          "Location Permission Required",
          "Location permission is required to find nearby shops. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: async () => {
                await Linking.openSettings();
              },
            },
          ]
        );
      }
    } catch (error) {
      handleError(
        error,
        "useLocation.requestLocationPermission",
        "Failed to request location permission"
      );
      Alert.alert("Error", "Failed to request location permission.");
    } finally {
      setLocationLoading(false);
    }
  }, [getCurrentLocation]);

  // Request location permission on mount
  useEffect(() => {
    const requestLocationOnMount = async () => {
      try {
        // Check current permission status
        const { status: currentStatus } =
          await Location.getForegroundPermissionsAsync();

        if (currentStatus === "granted") {
          setLocationPermission(true);
          // Automatically get location if permission already granted
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setUserLocation({ latitude: lat, longitude: lng });
        } else {
          // Request permission
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === "granted");
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            const lat = location.coords.latitude;
            const lng = location.coords.longitude;
            setLatitude(lat.toString());
            setLongitude(lng.toString());
            setUserLocation({ latitude: lat, longitude: lng });
          }
        }
      } catch (error) {
        handleError(
          error,
          "useLocation.requestLocationOnMount",
          "Failed to request location permission"
        );
        setLocationPermission(false);
      } finally {
        // Always set loading to false after mount initialization
        setLocationLoading(false);
      }
    };

    requestLocationOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    userLocation,
    latitude,
    longitude,
    locationPermission,
    locationLoading,
    requestLocationPermission,
    getCurrentLocation,
  };
}

