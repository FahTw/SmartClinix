
package handler

import (
	"net/http"
	"patient/model"
	"patient/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PatientHandler struct {
	repo repository.PatientRepository
}

func NewPatientHandler(repo repository.PatientRepository) *PatientHandler {
	return &PatientHandler{repo}
}

func (h *PatientHandler) Create(c *gin.Context) {
	var patient model.Patient

	if err := c.ShouldBindJSON(&patient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Create(&patient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, patient)
}

func (h *PatientHandler) GetAll(c *gin.Context) {
	patients, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, patients)
}

func (h *PatientHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	patient, err := h.repo.GetByID(uint(idUint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}
	c.JSON(http.StatusOK, patient)
}

func (h *PatientHandler) Update(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	var patient model.Patient
	if err := c.ShouldBindJSON(&patient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	patient.ID = uint(idUint)

	if err := h.repo.Update(&patient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, patient)
}

func (h *PatientHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	if err := h.repo.Delete(uint(idUint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Patient deleted"})
}
