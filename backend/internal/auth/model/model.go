package model

type User struct {
	ID 	 uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"uniqueIndex;not null" json:"username"`
	Password string `gorm:"not null" json:"-"`
	Role     string `gorm:"not null" json:"role"` // doctor, pharmacist, admin
}


