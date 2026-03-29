package model

import (
	"github.com/lib/pq" // สำหรับจัดการ String Array ใน PostgreSQL
)

type Patient struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	FirstName         string         `gorm:"not null" json:"first_name"`
	LastName          string         `gorm:"not null" json:"last_name"`
	Age               int            `json:"age"`
	Gender            string         `json:"gender"`
	PersonalID        string         `gorm:"uniqueIndex;not null" json:"personal_id"` //เลขบัตรปชช
	PharmacistHistory pq.StringArray `gorm:"type:text[]" json:"pharmacist_history"`
	DiseaseHistory    pq.StringArray `gorm:"type:text[]" json:"disease_history"`
}
