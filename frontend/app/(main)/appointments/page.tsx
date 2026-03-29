"use client"

import { useEffect, useState } from "react"
import AppointRegist, { AppointFormData } from "@/components/feature/AppointRegist"
import Header from "@/components/layout/Header"
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients, getDoctors, Patient, Doctor } from "@/lib/api"

type AppointmentStatus = "scheduled" | "completed" | "cancelled"

interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  time: string
  description: string
  status: AppointmentStatus
}

interface ApiAppointment {
  id: number
  patient_id: number
  doctor_id: number
  date: string
  time: string
  description?: string
  status?: string
}

const statusClassMap: Record<AppointmentStatus, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const statusTextMap: Record<AppointmentStatus, string> = {
  scheduled: "รอนัด",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิก",
}

function normalizeStatus(status?: string): AppointmentStatus {
  if (status === "completed" || status === "cancelled") {
    return status
  }
  return "scheduled"
}

function mapApiAppointment(item: ApiAppointment): Appointment {
  return {
    id: item.id,
    patient_id: item.patient_id,
    doctor_id: item.doctor_id,
    date: item.date,
    time: item.time,
    description: item.description || "-",
    status: normalizeStatus(item.status),
  }
}

function getPatientDisplayName(patients: Patient[], patientID: number): string {
  const patient = patients.find((item) => item.id === patientID)
  if (!patient) {
    return `ID: ${patientID}`
  }
  return `${patient.first_name} ${patient.last_name}`
}

export default function AppointmentPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointmentID, setEditingAppointmentID] = useState<number | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const today = new Date().toISOString().split("T")[0]

  const getDoctorDisplayName = (doctorID: number) => {
    const doctor = doctors.find((item) => item.id === doctorID)
    return doctor ? doctor.username : `ID: ${doctorID}`
  }

  const handleSubmit = async (formData: AppointFormData) => {
    try {
      if (editingAppointmentID !== null) {
        const updated = await updateAppointment(editingAppointmentID, formData)
        setAppointments((prev) => prev.map((item) => (item.id === editingAppointmentID ? mapApiAppointment(updated) : item)))
        setEditingAppointmentID(null)
      } else {
        const created = await createAppointment(formData)
        setAppointments((prev) => [mapApiAppointment(created), ...prev])
      }
    } catch (error) {
      console.error("Error creating appointment:", error)
    }
  }

  const onEditAppointment = (id: number) => {
    setEditingAppointmentID(id)
    setIsDialogOpen(true)
  }

  const onDeleteAppointment = async (id: number) => {
    const confirmed = window.confirm("ต้องการลบนัดหมายนี้หรือไม่?")
    if (!confirmed) return

    try {
      await deleteAppointment(id)
      setAppointments((prev) => prev.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting appointment:", error)
    }
  }

  const editingAppointment = editingAppointmentID !== null
    ? appointments.find((item) => item.id === editingAppointmentID) || null
    : null

  const initialFormData: AppointFormData | null = editingAppointment
    ? {
      patient_id: editingAppointment.patient_id,
      doctor_id: editingAppointment.doctor_id,
      date: editingAppointment.date,
      time: editingAppointment.time,
      description: editingAppointment.description === "-" ? "" : editingAppointment.description,
      status: editingAppointment.status,
    }
    : null
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsResult, patientsResult, doctorsResult] = await Promise.allSettled([
          getAppointments(),
          getPatients(),
          getDoctors(),
        ])

        const appointmentsData = appointmentsResult.status === "fulfilled" ? appointmentsResult.value : []
        const patientsData = patientsResult.status === "fulfilled" ? patientsResult.value : []
        const doctorsData = doctorsResult.status === "fulfilled" ? doctorsResult.value : []

        const mapped = Array.isArray(appointmentsData) ? appointmentsData.map((item: ApiAppointment) => mapApiAppointment(item)) : []
        setAppointments(mapped)
        setPatients(Array.isArray(patientsData) ? patientsData : [])
        setDoctors(Array.isArray(doctorsData) ? doctorsData : [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }
    fetchData()
  }, [])
  



  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Header title="จัดการนัดหมาย" description="สร้าง ติดตาม และบริหารคิวผู้ป่วยรายวัน" />

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            เพิ่มนัดหมาย
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-medium">นัดหมายทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{appointments.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-medium">นัดหมายวันนี้</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {appointments.filter((item) => item.date === today).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="text-gray-600 text-sm font-medium">รอพบแพทย์</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {appointments.filter((item) => item.status === "scheduled").length}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เวลา</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ป่วย</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แพทย์</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อาการ/รายละเอียด</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.length > 0 ? (
                  appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{appointment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{appointment.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getPatientDisplayName(patients, appointment.patient_id)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getDoctorDisplayName(appointment.doctor_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-sm">{appointment.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClassMap[appointment.status]}`}>
                          {statusTextMap[appointment.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEditAppointment(appointment.id)}
                            className="px-3 py-1 text-xs rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => onDeleteAppointment(appointment.id)}
                            className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      ไม่พบนัดหมายตามคำค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          แสดงผลลัพธ์ {appointments.length} จาก {appointments.length} รายการ
        </div>
      </div>

      <AppointRegist
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingAppointmentID(null)
          }
        }}
        patients={patients}
        doctors={doctors}
        initialData={initialFormData}
        title={editingAppointment ? "แก้ไขนัดหมาย" : "เพิ่มนัดหมายผู้ป่วย"}
        submitLabel={editingAppointment ? "อัปเดตนัดหมาย" : "บันทึกนัดหมาย"}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
