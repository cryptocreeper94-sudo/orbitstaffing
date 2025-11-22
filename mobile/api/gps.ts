import api from './auth';
import * as Location from 'expo-location';
import { useMutation, useQuery } from 'react-query';

export interface GPSCheckIn {
  id: string;
  assignmentId: string;
  checkInTime: string;
  checkInLatitude: number;
  checkInLongitude: number;
  accuracy: number;
  jobSiteLatitude: number;
  jobSiteLongitude: number;
  distanceMeters: number;
  withinGeofence: boolean;
}

export interface GPSCheckOut {
  id: string;
  checkOutTime: string;
  checkOutLatitude: number;
  checkOutLongitude: number;
  accuracy: number;
  distanceMeters: number;
  withinGeofence: boolean;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  const permitted = await requestLocationPermission();
  if (!permitted) {
    throw new Error('Location permission denied');
  }

  const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Best });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
}

export async function checkInGPS(
  assignmentId: string,
  jobSiteLatitude: number,
  jobSiteLongitude: number,
  geofenceRadiusFeet: number = 250
): Promise<GPSCheckIn> {
  const location = await getCurrentLocation();
  const geofenceRadiusMeters = geofenceRadiusFeet * 0.3048;
  const distance = calculateDistance(
    location.latitude,
    location.longitude,
    jobSiteLatitude,
    jobSiteLongitude
  );

  const response = await api.post(`/assignments/${assignmentId}/gps-checkin`, {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    distance,
    withinGeofence: distance <= geofenceRadiusMeters,
  });

  return response.data;
}

export async function checkOutGPS(assignmentId: string): Promise<GPSCheckOut> {
  const location = await getCurrentLocation();
  const response = await api.post(`/assignments/${assignmentId}/gps-checkout`, {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
  });

  return response.data;
}

export async function getCheckInHistory(assignmentId: string) {
  const response = await api.get(`/assignments/${assignmentId}/gps-history`);
  return response.data;
}

export function useCheckInGPS() {
  return useMutation(({ assignmentId, jobSiteLat, jobSiteLon, geofenceRadius }: {
    assignmentId: string;
    jobSiteLat: number;
    jobSiteLon: number;
    geofenceRadius?: number;
  }) => checkInGPS(assignmentId, jobSiteLat, jobSiteLon, geofenceRadius));
}

export function useCheckOutGPS() {
  return useMutation((assignmentId: string) => checkOutGPS(assignmentId));
}

export function useCheckInHistory(assignmentId: string) {
  return useQuery(['checkInHistory', assignmentId], () => getCheckInHistory(assignmentId));
}
