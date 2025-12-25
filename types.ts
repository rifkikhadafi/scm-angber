
export type UnitType = 'Crane' | 'Foco Crane' | 'Primemover' | 'Picker' | 'TSO';

export type OrderStatus = 'Requested' | 'On Progress' | 'Pending' | 'Closed' | 'Canceled';

export interface Order {
  id: string;
  unit: UnitType;
  ordererName: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  details: string;
  status: OrderStatus;
  createdAt: string;
}

export interface FonnteResponse {
  status: boolean;
  reason?: string;
}

export type ViewType = 'dashboard' | 'new' | 'change' | 'schedule';

export interface RegistrationData {
  fullName: string;
  gender: string;
  age: string;
}

export enum FormStatus {
  IDLE = 'IDLE',
  SUBMITTING = 'SUBMITTING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
