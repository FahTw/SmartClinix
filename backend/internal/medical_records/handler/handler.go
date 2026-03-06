package handler

import (
	"net/http"
	"medical_records/model"
	"medical_records/repository"
	"strconv"
	"github.com/gin-gonic/gin"
)

type MedicalRecordHandler struct {
	repo repository.MedicalRecordRepository
}

func NewMedicalRecordHandler(repo repository.MedicalRecordRepository) *MedicalRecordHandler {
	return &MedicalRecordHandler{repo}
}
func (h *MedicalRecordHandler) Create(c *gin.Context) {
	var record model.MedicalRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Create(&record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, record)
}


func (h *MedicalRecordHandler) GetAll(c *gin.Context) {
	records, err := h.repo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (h *MedicalRecordHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	record, err := h.repo.GetByID(uint(idUint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Medical record not found"})
		return
	}
	c.JSON(http.StatusOK, record)
}

func (h *MedicalRecordHandler) Update(c *gin.Context) {
	id := c.Param("id")
	idUint, err := strconv.ParseUint(id, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}
	var record model.MedicalRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	record.ID = uint(idUint)

	if err := h.repo.Update(&record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, record)
}

func (h *MedicalRecordHandler) Delete(c *gin.Context) {
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
	c.JSON(http.StatusOK, gin.H{"message": "Medical record deleted"})
}
