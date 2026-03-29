package model

import "time"

type MedicalRecord struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	AppointmentID uint      `gorm:"not null;uniqueIndex" json:"appointment_id"`
	PatientID     uint      `gorm:"not null;index" json:"patient_id"`
	DoctorID      uint      `gorm:"not null;index" json:"doctor_id"`
	VisitDate     time.Time `gorm:"not null" json:"visit_date"`
	Diagnosis     string    `gorm:"not null" json:"diagnosis"`
	Treatment     string    `gorm:"not null" json:"treatment"`
	Note          *string   `gorm:"default:null" json:"note,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
