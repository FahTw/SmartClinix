package model
import "time"
type MedicalRecord struct {
	ID           uint	`gorm:"primaryKey" json:"id"`
	PatientID    uint	`gorm:"not null" json:"patient_id"`
	PatientName  string	`gorm:"not null" json:"patient_name"`
	DoctorID     uint	`gorm:"not null" json:"doctor_id"`
	DoctorName   string	`gorm:"not null" json:"doctor_name"`
	VisitDate    time.Time	`gorm:"not null" json:"visit_date"`
	Diagnosis    string	`gorm:"not null" json:"diagnosis"`
	Treatment    string	`gorm:"not null" json:"treatment"`
	Note         string	`gorm:"default:null" json:"note"`
}