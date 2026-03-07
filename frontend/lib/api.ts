const API_ROUTES = {
  APPOINTMENTS: 'http://localhost:8083/appointments',
  MEDICAL_RECORDS: 'http://localhost:8081/medical-records',
  PATIENTS: 'http://localhost:8080/patients',
  
};


export async function getAppointments() {
  const res = await fetch(API_ROUTES.APPOINTMENTS);
  if (!res.ok) {
    throw new Error('Failed to fetch appointments');
  }
  return res.json();
}

export async function createAppointment(appointmentData: any) {
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
  return res.json();
}

export async function updateAppointment(id: number, appointmentData: any) {
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
  return res.json();
}

export async function getMedicalRecords(patientId: number) {
  const res = await fetch(`${API_ROUTES.MEDICAL_RECORDS}?patientId=${patientId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch medical records');
  }
  return res.json();
}

export async function createMedicalRecords(medicalRecordData: any) {
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
  return res.json();
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