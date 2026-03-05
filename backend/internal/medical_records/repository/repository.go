package repository

import (
	"medical_records/model"
	"gorm.io/gorm"
)

type MedicalRecordRepository interface {
	Create(record *model.Record) error
	GetByID(id uint) (*model.Record, error)
	Update(record *model.Record) error
	Delete(id uint) error
	FindAll() ([]model.Record, error)
}

type medicalRecordRepo struct {
	db *gorm.DB
}

func NewMedicalRecordRepository(db *gorm.DB) MedicalRecordRepository {
	return &medicalRecordRepo{db}
}

func (r *medicalRecordRepo) Create(record *model.Record) error {
	return r.db.Create(record).Error
}

func (r *medicalRecordRepo) GetByID(id uint) (*model.Record, error) {
	var record model.Record
	err := r.db.First(&record, id).Error
	return &record, err
}

func (r *medicalRecordRepo) Update(record *model.Record) error {
	return r.db.Save(record).Error
}

func (r *medicalRecordRepo) Delete(id uint) error {
	return r.db.Delete(&model.Record{}, id).Error
}

func (r *medicalRecordRepo) FindAll() ([]model.Record, error) {
	var records []model.Record
	err := r.db.Find(&records).Error
	return records, err
}