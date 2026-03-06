package repository

import (
	"medical_records/model"
	"gorm.io/gorm"
)

type MedicalRecordRepository interface {
	Create(record *model.MedicalRecord) error
	GetByID(id uint) (*model.MedicalRecord, error)
	Update(record *model.MedicalRecord) error
	Delete(id uint) error
	FindAll() ([]model.MedicalRecord, error)
}

type medicalRecordRepo struct {
	db *gorm.DB
}

func NewMedicalRecordRepository(db *gorm.DB) MedicalRecordRepository {
	return &medicalRecordRepo{db}
}

func (r *medicalRecordRepo) Create(record *model.MedicalRecord) error {
	return r.db.Create(record).Error
}

func (r *medicalRecordRepo) GetByID(id uint) (*model.MedicalRecord, error) {
	var record model.MedicalRecord
	err := r.db.First(&record, id).Error
	return &record, err
}

func (r *medicalRecordRepo) Update(record *model.MedicalRecord) error {
	return r.db.Save(record).Error
}

func (r *medicalRecordRepo) Delete(id uint) error {
	return r.db.Delete(&model.MedicalRecord{}, id).Error
}

func (r *medicalRecordRepo) FindAll() ([]model.MedicalRecord, error) {
	var records []model.MedicalRecord
	err := r.db.Find(&records).Error
	return records, err
}