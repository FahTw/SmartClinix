package model

type Appointment struct {
	ID          int    `json:"id"`
	PatientID   int    `json:"patient_id"`
	DoctorID    int    `json:"doctor_id"`
	Date        string `json:"date"`
	Time        string `json:"time"`
	Description string `json:"description"`
}