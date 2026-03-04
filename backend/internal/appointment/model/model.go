package model

import "time"

type Appointment struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	PatientID   uint      `gorm:"not null" json:"patient_id"`
	DoctorID    uint      `gorm:"not null" json:"doctor_id"`
	Date        string    `gorm:"not null" json:"date"` // รูปแบบ "YYYY-MM-DD"
	Time        string    `gorm:"not null" json:"time"` // รูปแบบ "HH:MM"
	Description string    `json:"description"`
	Status      string    `gorm:"default:'scheduled'" json:"status"` // scheduled, cancelled, completed
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}