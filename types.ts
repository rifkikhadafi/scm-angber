
export type UnitType = 'Crane' | 'Foco Crane' | 'Primemover' | 'Picker' | 'TSO';

export type OrderStatus = 'Requested' | 'On Progress' | 'Pending' | 'Closed';

export interface Order {
  id: string;
  unit: UnitType;
  date: string;
  startTime: string;
  endTime: string;
  details: string;
  status: OrderStatus;
  createdAt: string;
}

export interface FonnteResponse {
  status: boolean;
  reason?: string;
}

export type ViewType = 'dashboard' | 'new' | 'change' | 'schedule';

// Added RegistrationData for RegistrationForm.tsx
export interface RegistrationData {
  fullName: string;
  gender: string;
  age: string;
}

// Added FormStatus enum for RegistrationForm.tsx
export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
