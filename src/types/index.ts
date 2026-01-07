export interface CompanyConfig {
  name: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  logoUrl: string | null;
  accentColor: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  emergencyContact?: string;
  phone?: string;
  address?: string;
  photoUrl: string | null;
  zoneColor?: string;
}

export interface PrintConfig {
  scale: number;
  showBleed: boolean;
  showCutMarks: boolean;
  pageFormat: 'a4';
  orientation: 'portrait';
  printBackSide?: boolean;
}
