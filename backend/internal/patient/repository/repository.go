package repository

import (
	"patient/model"
	"gorm.io/gorm"
)

type PatientRepository interface {
	Create(patient *model.Patient) error
	GetByID(id uint) (*model.Patient, error)
	Update(patient *model.Patient) error
	Delete(id uint) error
	FindAll() ([]model.Patient, error)
}

type patientRepo struct {
	db *gorm.DB
}

func NewPatientRepository(db *gorm.DB) PatientRepository {
	return &patientRepo{db}
}

// เพิ่มผู้ป่วยใหม่
func (r *patientRepo) Create(p *model.Patient) error {
	return r.db.Create(p).Error
}

// ค้นหาผู้ป่วยด้วย ID
func (r *patientRepo) GetByID(id uint) (*model.Patient, error) {
	var p model.Patient
	err := r.db.First(&p, id).Error
	return &p, err
}

// แก้ไขข้อมูลผู้ป่วย
func (r *patientRepo) Update(p *model.Patient) error {
	return r.db.Save(p).Error
}

// ลบผู้ป่วย (เผื่อไว้)
func (r *patientRepo) Delete(id uint) error {
	return r.db.Delete(&model.Patient{}, id).Error
}

// ดึงรายชื่อผู้ป่วยทั้งหมด
func (r *patientRepo) FindAll() ([]model.Patient, error) {
	var patients []model.Patient
	err := r.db.Find(&patients).Error
	return patients, err
}