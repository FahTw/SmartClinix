package model
import "time"
type MedicalRecord struct {
	ID           int	`gorm:"primaryKey" json:"id"`
	PatientID    int	`gorm:"not null" json:"patient_id"`
	DoctorID     int	`gorm:"not null" json:"doctor_id"`
	VisitDate    time.Time	`gorm:"not null" json:"visit_date"`
	Diagnosis    string	`gorm:"not null" json:"diagnosis"`
	Treatment    string	`gorm:"not null" json:"treatment"`
	Note         string	`gorm:"default:null" json:"note"`
}