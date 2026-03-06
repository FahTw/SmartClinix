package handler

import (
	"fmt"
	"net/http"

	"patient/model"
	"patient/repository"

	"github.com/gin-gonic/gin"
)

// Handler functions will be implemented in main.go
// This is a placeholder file for future handler extraction
type Handler struct {
	repo repository.PatientRepository
}
func NewPatientHandler(repo repository.PatientRepository) *Handler {
	return &Handler{repo: repo}
}
func (h *Handler) CreatePatient(c *gin.Context) {
	var newPatient model.Patient
	if err := c.ShouldBindJSON(&newPatient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Create(&newPatient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create patient"})
		return
	}
	c.JSON(http.StatusCreated, newPatient)
}
func (h *Handler) GetAllPatients(c *gin.Context) {
	patients, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch patients"})
		return
	}
	c.JSON(http.StatusOK, patients)
}
func (h *Handler) GetPatientByID(c *gin.Context) {
	idParam := c.Param("id")
	var id uint
	if _, err := fmt.Sscanf(idParam, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid patient ID"})
		return
	}
	patient, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}
	c.JSON(http.StatusOK, patient)
}