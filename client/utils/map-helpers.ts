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
 * Calculate zoom level from desired radius
 * Approximates the zoom level needed to show a specific radius in kilometers
 * @param radiusKm Desired radius in kilometers (1-20km)
 * @param latitude Latitude for accurate calculation
 * @returns Zoom level that approximately shows the desired radius
 */
export function calculateZoomFromRadius(radiusKm: number, latitude: number): number {
  // Approximate formula based on Google Maps zoom levels
  // At the equator: 1 degree ≈ 111 km
  // Zoom level formula: zoom ≈ log2(360 * 111 / (radius * 2))
  
  // Account for latitude (longitude degrees get smaller away from equator)
  const latitudeScale = Math.cos(latitude * Math.PI / 180);
  
  // Approximate calculation
  // For a given radius, we want to show roughly 2*radius degrees
  // Using the formula: zoom ≈ log2(360 * 111 * latitudeScale / (2 * radiusKm))
  const degreesForRadius = (2 * radiusKm) / (111 * Math.max(latitudeScale, 0.1));
  const zoom = Math.log2(360 / degreesForRadius);
  
  // Clamp zoom between reasonable bounds (10-18)
  return Math.max(10, Math.min(18, Math.round(zoom * 10) / 10));
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

