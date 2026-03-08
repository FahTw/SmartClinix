const API_ROUTES = {
  APPOINTMENTS: 'http://localhost:8083/appointments',
  MEDICAL_RECORDS: 'http://localhost:8081/medical-records',
  PATIENTS: 'http://localhost:8080/patients',
  
};

export type MedicalRecordPayload = {
  patient_id: number;
  doctor_id: number;
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