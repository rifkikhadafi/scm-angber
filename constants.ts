
export const FONNTE_API_TOKEN = 'gbEKgb8a9AETB3j7ajST'; 
export const FONNTE_TARGET_GROUP_ID = '120363403134308128@g.us';

export const UNIT_TYPES: string[] = [
  'Crane',
  'Foco Crane',
  'Primemover',
  'Picker',
  'TSO'
];

export const STATUS_COLORS: Record<string, string> = {
  'Requested': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'On Progress': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Pending': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Closed': 'bg-green-500/20 text-green-400 border-green-500/30'
};

// Added GENDER_OPTIONS for RegistrationForm.tsx
export const GENDER_OPTIONS: string[] = ['Laki-laki', 'Perempuan'];
