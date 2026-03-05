package repository

import (
	"appointment/model"
	"gorm.io/gorm"
)

type AppointmentRepository interface {
	Create(appt *model.Appointment) error
	GetByID(id uint) (*model.Appointment, error)
	Update(appt *model.Appointment) error
}

type appointmentRepo struct {
	db *gorm.DB
}

func NewAppointmentRepository(db *gorm.DB) AppointmentRepository {
	return &appointmentRepo{db}
}

func (r *appointmentRepo) Create(appt *model.Appointment) error {
	return r.db.Create(appt).Error
}

func (r *appointmentRepo) GetByID(id uint) (*model.Appointment, error) {
	var appt model.Appointment
	err := r.db.First(&appt, id).Error
	return &appt, err
}

func (r *appointmentRepo) Update(appt *model.Appointment) error {
	return r.db.Save(appt).Error
}
