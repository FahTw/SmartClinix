const API_ROUTES = {
  APPOINTMENTS: 'http://localhost:8083/appointments',
  MEDICAL_RECORDS: 'http://localhost:8081/medical-records',
  PATIENTS: 'http://localhost:8080/patients',
  AUTH: 'http://localhost:8082/auth',
};

export type MedicalRecordPayload = {
  patient_name: string;
  doctor_name: string;
  visit_date: string;
  diagnosis: string;
  treatment: string;
  note: string;
};

export type MedicalRecord = Omit<MedicalRecordPayload, 'note'> & {
  id: number;
  note: string | null;
};

export type AppointmentPayload = {
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};

export type Appointment = AppointmentPayload & {
  id: number;
  created_at?: string;
  updated_at?: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  role: 'doctor' | 'pharmacist' | 'admin';
};

export type User = {
  id: number;
  username: string;
  role: string;
};

// Auth helpers
const TOKEN_KEY = 'auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// Auth API functions
export async function login(credentials: LoginPayload): Promise<{ token: string }> {
  const res = await fetch(`${API_ROUTES.AUTH}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function register(userData: RegisterPayload): Promise<User> {
  const res = await fetch(`${API_ROUTES.AUTH}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }
  return res.json();
}

export async function getCurrentUser(): Promise<User> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token');
  }
  
  const res = await fetch(`${API_ROUTES.AUTH}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to get current user');
  }
  return res.json();
}

export function logout(): void {
  removeAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function getAppointments() {
  const res = await fetch(API_ROUTES.APPOINTMENTS);
  if (!res.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return res.json() as Promise<Appointment[]>;
}

export async function createAppointment(appointmentData: AppointmentPayload) {
  const res = await fetch(API_ROUTES.APPOINTMENTS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  if (!res.ok) {
    throw new Error('Failed to create appointment');
  }
  return res.json() as Promise<Appointment>;
}

export async function updateAppointment(id: number, appointmentData: AppointmentPayload) {
  const res = await fetch(`${API_ROUTES.APPOINTMENTS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(appointmentData),
  });
  if (!res.ok) {
    throw new Error('Failed to update appointment');
  }
  return res.json() as Promise<Appointment>;
}

export async function getMedicalRecords() {
  const res = await fetch(API_ROUTES.MEDICAL_RECORDS);
  if (!res.ok) {
    throw new Error('Failed to fetch medical records');
  }
  return res.json() as Promise<MedicalRecord[]>;
}

export async function createMedicalRecord(medicalRecordData: MedicalRecordPayload) {
  const res = await fetch(API_ROUTES.MEDICAL_RECORDS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicalRecordData),
  });
  if (!res.ok) {
    throw new Error('Failed to create medical record');
  }
  return res.json() as Promise<MedicalRecord>;
}

export async function updateMedicalRecord(id: number, medicalRecordData: MedicalRecordPayload) {
  const res = await fetch(`${API_ROUTES.MEDICAL_RECORDS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicalRecordData),
  });
  if (!res.ok) {
    throw new Error('Failed to update medical record');
  }
  return res.json() as Promise<MedicalRecord>;
}

export async function deleteMedicalRecord(id: number) {
  const res = await fetch(`${API_ROUTES.MEDICAL_RECORDS}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete medical record');
  }
  return res.json() as Promise<{ message: string }>;
}

export async function getPatients() {
  const res = await fetch(API_ROUTES.PATIENTS);
  if (!res.ok) {
    throw new Error('Failed to fetch patients');
  }
  return res.json();
}

export async function createPatient(patientData: any) {
  const res = await fetch(API_ROUTES.PATIENTS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patientData),
  });
  if (!res.ok) {
    throw new Error('Failed to create patient');
  }
  return res.json();
}