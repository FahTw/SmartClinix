"use client"

import { useEffect, useMemo, useState } from "react"
import Header from "@/components/layout/Header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Appointment,
  createMedicalRecord,
  deleteMedicalRecord,
  getAppointments,
  getDoctors,
  getMedicalRecords,
  getPatients,
  Doctor,
  MedicalRecord,
  Patient,
  updateMedicalRecord,
} from "@/lib/api"

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [createError, setCreateError] = useState("")
  const [updateError, setUpdateError] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRecordID, setEditingRecordID] = useState<number | null>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [treatment, setTreatment] = useState("")
  const [note, setNote] = useState("")
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null)
  const [createForm, setCreateForm] = useState({
    appointment_id: 0,
    patient_id: 0,
    doctor_id: 0,
    visit_date: "",
    diagnosis: "Pending",
    treatment: "Pending",
    note: "",
  })

  const fetchMedicalRecords = async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true)
      }
      setError("")

      const [recordsRes, appointmentsRes, patientsRes, doctorsRes] = await Promise.allSettled([
        getMedicalRecords(),
        getAppointments(),
        getPatients(),
        getDoctors(),
      ])

      const data = recordsRes.status === "fulfilled" ? recordsRes.value : []
      const appointmentsData = appointmentsRes.status === "fulfilled" ? appointmentsRes.value : []
      const patientsData = patientsRes.status === "fulfilled" ? patientsRes.value : []
      const doctorsData = doctorsRes.status === "fulfilled" ? doctorsRes.value : []

      setRecords(Array.isArray(data) ? data : [])
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : [])
      setPatients(Array.isArray(patientsData) ? patientsData : [])
      setDoctors(Array.isArray(doctorsData) ? doctorsData : [])
      setLastSyncedAt(new Date())

      if (recordsRes.status === "rejected") {
        throw recordsRes.reason
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch medical records"
      setError(message)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchMedicalRecords(true)

    const intervalId = setInterval(() => {
      fetchMedicalRecords(false)
    }, 5000)

    return () => clearInterval(intervalId)
  }, [])

  const queuedAppointments = useMemo(
    () => appointments.filter((appointment) => !records.some((record) => record.appointment_id === appointment.id)),
    [appointments, records],
  )

  const getPatientDisplayName = (patientID: number) => {
    const patient = patients.find((item) => item.id === patientID)
    if (!patient) return `ID: ${patientID}`
    return `${patient.first_name} ${patient.last_name}`
  }

  const getDoctorDisplayName = (doctorID: number) => {
    const doctor = doctors.find((item) => item.id === doctorID)
    if (!doctor) return `ID: ${doctorID}`
    return doctor.username
  }

  const onDeleteRecord = async (id: number) => {
    try {
      await deleteMedicalRecord(id)
      setRecords((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete medical record"
      setError(message)
    }
  }

  const onStartEditRecord = (record: MedicalRecord) => {
    setUpdateError("")
    setEditingRecordID(record.id)
    setDiagnosis(record.diagnosis)
    setTreatment(record.treatment)
    setNote(record.note || "")
  }

  const onCancelEdit = () => {
    setEditingRecordID(null)
    setDiagnosis("")
    setTreatment("")
    setNote("")
    setUpdateError("")
  }

  const onSaveEdit = async () => {
    if (editingRecordID === null) return

    const target = records.find((item) => item.id === editingRecordID)
    if (!target) return

    try {
      setIsUpdating(true)
      setUpdateError("")
      const updated = await updateMedicalRecord(editingRecordID, {
        appointment_id: target.appointment_id,
        patient_id: target.patient_id,
        doctor_id: target.doctor_id,
        visit_date: target.visit_date,
        diagnosis: diagnosis.trim() || "Pending",
        treatment: treatment.trim() || "Pending",
        note: note.trim() || undefined,
      })

      setRecords((prev) => prev.map((item) => (item.id === editingRecordID ? updated : item)))
      onCancelEdit()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update medical record"
      setUpdateError(message)
    } finally {
      setIsUpdating(false)
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      appointment_id: 0,
      patient_id: 0,
      doctor_id: 0,
      visit_date: "",
      diagnosis: "Pending",
      treatment: "Pending",
      note: "",
    })
    setCreateError("")
  }

  const onOpenCreateDialog = (appointment?: Appointment) => {
    setCreateError("")
    if (appointment) {
      const visitDate = `${appointment.date}T${appointment.time}`
      setCreateForm({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        visit_date: visitDate,
        diagnosis: "Pending",
        treatment: "Pending",
        note: "Manual fallback from frontend",
      })
    } else {
      resetCreateForm()
    }
    setIsCreateOpen(true)
  }

  const onSubmitCreate = async () => {
    if (!createForm.appointment_id || !createForm.patient_id || !createForm.doctor_id || !createForm.visit_date) {
      setCreateError("กรุณากรอกข้อมูลให้ครบ: appointment_id, patient, doctor และ visit date")
      return
    }

    try {
      setIsCreating(true)
      setCreateError("")

      const created = await createMedicalRecord({
        appointment_id: Number(createForm.appointment_id),
        patient_id: Number(createForm.patient_id),
        doctor_id: Number(createForm.doctor_id),
        visit_date: new Date(createForm.visit_date).toISOString(),
        diagnosis: createForm.diagnosis.trim() || "Pending",
        treatment: createForm.treatment.trim() || "Pending",
        note: createForm.note.trim() || undefined,
      })

      setRecords((prev) => [created, ...prev])
      setIsCreateOpen(false)
      resetCreateForm()
      await fetchMedicalRecords(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create medical record"
      setCreateError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return records

    return records.filter((record) => {
      return (
        String(record.appointment_id).includes(q) ||
        String(record.patient_id).includes(q) ||
        String(record.doctor_id).includes(q) ||
        record.diagnosis.toLowerCase().includes(q) ||
        record.treatment.toLowerCase().includes(q) ||
        (record.note ?? "").toLowerCase().includes(q) ||
        getPatientDisplayName(record.patient_id).toLowerCase().includes(q) ||
        getDoctorDisplayName(record.doctor_id).toLowerCase().includes(q)
      )
    })
  }, [records, searchTerm, patients, doctors])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Header title="Medical Records (Auto Flow)" description="Appointment ส่งเข้า queue และ consumer สร้าง medical record อัตโนมัติ จากนั้นแก้ไข diagnosis/treatment/note ได้ที่หน้านี้" />

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="ค้นหา appointment_id, patient/doctor, diagnosis, treatment, note"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            อัปเดตอัตโนมัติทุก 5 วินาที {lastSyncedAt ? `(ล่าสุด ${lastSyncedAt.toLocaleTimeString("th-TH")})` : ""}
          </div>
          <button onClick={() => fetchMedicalRecords(true)} className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
            รีเฟรชข้อมูล
          </button>
          <button onClick={() => onOpenCreateDialog()} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            เพิ่มประวัติการรักษา
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-medium">Medical Records ทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{records.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-medium">คิว Appointment รอสร้าง</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{queuedAppointments.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
            <div className="text-gray-600 text-sm font-medium">พบผลการค้นหา</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{filteredRecords.length}</div>
          </div>
        </div>

        {queuedAppointments.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800">รายการนัดหมายที่ยังไม่มี Medical Record</h3>
            <p className="text-xs text-gray-500 mt-1">ถ้าระบบอัตโนมัติยังไม่สร้าง สามารถกดสร้างเองได้ทันที</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {queuedAppointments.slice(0, 8).map((appointment) => (
                <button
                  key={appointment.id}
                  onClick={() => onOpenCreateDialog(appointment)}
                  className="px-3 py-2 text-sm rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  สร้างจาก Appointment #{appointment.id}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Treatment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-red-600">{error}</td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{record.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">#{record.appointment_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getPatientDisplayName(record.patient_id)} (ID: {record.patient_id})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{getDoctorDisplayName(record.doctor_id)} (ID: {record.doctor_id})</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(record.visit_date).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.diagnosis}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.treatment}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.note || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onStartEditRecord(record)}
                            className="px-3 py-1 text-sm rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">ยังไม่มีข้อมูลที่รับมาจาก Queue</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">แสดงผลลัพธ์ {filteredRecords.length} จาก {records.length} รายการ</div>
      </div>

      <Dialog
        open={editingRecordID !== null}
        onOpenChange={(open) => {
          if (!open) {
            onCancelEdit()
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>แก้ไข Medical Record {editingRecordID !== null ? `#${editingRecordID}` : ""}</DialogTitle>
            <DialogDescription>
              ปรับปรุงข้อมูลการรักษา (diagnosis, treatment, note)
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Diagnosis"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Treatment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {updateError && <p className="text-xs text-red-600">{updateError}</p>}

          <DialogFooter>
            <button
              onClick={onCancelEdit}
              className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSaveEdit}
              disabled={isUpdating}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isUpdating ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) {
            resetCreateForm()
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>สร้าง Medical Record แบบ Manual</DialogTitle>
            <DialogDescription>
              ใช้กรณี queue หรือ consumer สะดุด เพื่อให้ workflow เดินต่อได้
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Appointment ID</label>
              <input
                type="number"
                value={createForm.appointment_id || ""}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, appointment_id: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Visit Date</label>
              <input
                type="datetime-local"
                value={createForm.visit_date}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, visit_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Patient</label>
              <select
                value={createForm.patient_id || ""}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, patient_id: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">เลือกผู้ป่วย</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} (ID: {patient.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Doctor</label>
              <select
                value={createForm.doctor_id || ""}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, doctor_id: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">เลือกแพทย์</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.username} (ID: {doctor.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Diagnosis</label>
              <input
                type="text"
                value={createForm.diagnosis}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, diagnosis: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Treatment</label>
              <input
                type="text"
                value={createForm.treatment}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, treatment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Note</label>
            <textarea
              value={createForm.note}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {createError && <p className="text-xs text-red-600">{createError}</p>}

          <DialogFooter>
            <button
              onClick={() => {
                setIsCreateOpen(false)
                resetCreateForm()
              }}
              className="px-3 py-2 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSubmitCreate}
              disabled={isCreating}
              className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isCreating ? "กำลังสร้าง..." : "สร้าง Medical Record"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
