package model

import "time"

type Appointment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PatientID   uint      `gorm:"not null" json:"patient_id"`
    DoctorID    uint      `gorm:"not null" json:"doctor_id"`
	PatientName   string    `gorm:"not null" json:"patient_name"`
	DoctorName   string    `gorm:"not null" json:"doctor_name"`
	Date        string    `gorm:"not null" json:"date"`
	Time        string    `gorm:"not null" json:"time"`
	Description string    `json:"description"`
	Status      string    `gorm:"default:'scheduled'" json:"status"` 
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}