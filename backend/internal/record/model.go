package model

type Record struct {
	ID           int
	PatientID    int
	DoctorID     int
	VisitDate    string
	ChiefComplaint string
	Diagnosis    string
	Treatment    string
	Note         string
}