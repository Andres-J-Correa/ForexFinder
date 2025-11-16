/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the radius needed to cover a map region
 * Uses the diagonal distance from center to corner as radius
 * @param region Map region with latitude, longitude, latitudeDelta, longitudeDelta
 * @returns Radius in kilometers (capped at 20km max)
 */
export function calculateRadiusFromRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}): number {
  // Calculate the northeast corner of the visible region
  const northeastLat = region.latitude + region.latitudeDelta / 2;
  const northeastLng = region.longitude + region.longitudeDelta / 2;

  // Calculate the southwest corner of the visible region
  const southwestLat = region.latitude - region.latitudeDelta / 2;
  const southwestLng = region.longitude - region.longitudeDelta / 2;

  // Calculate diagonal distance (from center to corner)
  // This ensures all visible area is covered
  const diagonalDistance = calculateDistance(
    region.latitude,
    region.longitude,
    northeastLat,
    northeastLng,
  );

  // Add a small buffer (10%) to ensure edge shops are included
  const radiusWithBuffer = diagonalDistance * 1.1;

  // Cap at maximum 20km as per API requirements
  return Math.min(radiusWithBuffer, 20);
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "500m" or "2.5km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(2)}km`;
}

