import api from './auth';
import { useQuery, useMutation } from 'react-query';

export interface Assignment {
  id: string;
  jobId: string;
  workerId: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  status: 'assigned' | 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  confirmedByWorker: boolean;
  confirmedAt?: string;
  jobTitle: string;
  clientName: string;
  location: string;
  latitude: number;
  longitude: number;
  hourlyRate: number;
  gpsVerificationRequired: boolean;
}

export async function getMyAssignments(): Promise<Assignment[]> {
  const response = await api.get('/assignments/my');
  return response.data;
}

export async function getAssignmentDetails(assignmentId: string): Promise<Assignment> {
  const response = await api.get(`/assignments/${assignmentId}`);
  return response.data;
}

export async function confirmAssignment(assignmentId: string): Promise<void> {
  await api.post(`/assignments/${assignmentId}/confirm`);
}

export async function cancelAssignment(assignmentId: string, reason: string): Promise<void> {
  await api.post(`/assignments/${assignmentId}/cancel`, { reason });
}

export function useMyAssignments() {
  return useQuery('myAssignments', getMyAssignments, {
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useAssignmentDetails(assignmentId: string) {
  return useQuery(['assignment', assignmentId], () => getAssignmentDetails(assignmentId));
}

export function useConfirmAssignment() {
  return useMutation(confirmAssignment);
}

export function useCancelAssignment() {
  return useMutation(cancelAssignment);
}
