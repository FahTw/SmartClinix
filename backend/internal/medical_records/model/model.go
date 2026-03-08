package model
import "time"
type MedicalRecord struct {
	ID           uint	`gorm:"primaryKey" json:"id"`
	PatientName  string	`gorm:"not null" json:"patient_name"`
	DoctorName    string	`gorm:"not null" json:"doctor_name"`
	VisitDate    time.Time	`gorm:"not null" json:"visit_date"`
	Diagnosis    string	`gorm:"not null" json:"diagnosis"`
	Treatment    string	`gorm:"not null" json:"treatment"`
	Note         string	`gorm:"default:null" json:"note"`
}