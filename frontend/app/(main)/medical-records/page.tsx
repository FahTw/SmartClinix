"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import Header from "@/components/layout/Header"
import {
  createMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecords,
  MedicalRecord,
  MedicalRecordPayload,
} from "@/lib/api"

type MedicalRecordForm = {
  patient_id: string
  doctor_id: string
  visit_date: string
  diagnosis: string
  treatment: string
  note: string
}

const initialForm: MedicalRecordForm = {
  patient_id: "",
  doctor_id: "",
  visit_date: "",
  diagnosis: "",
  treatment: "",
  note: "",
}


export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [form, setForm] = useState<MedicalRecordForm>(initialForm)

  const fetchMedicalRecords = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await getMedicalRecords()
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch medical records"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedicalRecords()
  }, [])

  const onChangeForm = (field: keyof MedicalRecordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildPayload = (): MedicalRecordPayload | null => {
    if (!form.patient_id || !form.doctor_id || !form.visit_date || !form.diagnosis || !form.treatment) {
      setSubmitError("กรุณากรอกข้อมูลที่จำเป็นให้ครบ")
      return null
    }

    const patientId = Number(form.patient_id)
    const doctorId = Number(form.doctor_id)

    if (Number.isNaN(patientId) || Number.isNaN(doctorId)) {
      setSubmitError("patient_id และ doctor_id ต้องเป็นตัวเลข")
      return null
    }

    const parsedVisitDate = new Date(form.visit_date)
    if (Number.isNaN(parsedVisitDate.getTime())) {
      setSubmitError("visit_date ไม่ถูกต้อง")
      return null
    }

    return {
      patient_id: patientId,
      doctor_id: doctorId,
      visit_date: parsedVisitDate.toISOString(),
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
      note: form.note.trim(),
    }
  }

  const onCreateRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError("")

    const payload = buildPayload()
    if (!payload) return

    try {
      setIsSubmitting(true)
      const created = await createMedicalRecord(payload)
      setRecords((prev) => [created, ...prev])
      setForm(initialForm)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create medical record"
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
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

  const filteredRecords = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return records

    return records.filter((record) => {
      return (
        String(record.patient_id).includes(q) ||
        String(record.doctor_id).includes(q) ||
        record.diagnosis.toLowerCase().includes(q) ||
        record.treatment.toLowerCase().includes(q) ||
        (record.note ?? "").toLowerCase().includes(q)
      )
    })
  }, [records, searchTerm])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Header title="จัดการ Medical Records" description="บันทึกและติดตามประวัติการรักษาให้ตรงกับข้อมูลในระบบ" />

        <form onSubmit={onCreateRecord} className="mt-6 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">เพิ่มประวัติการรักษา</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <input
              type="number"
              min={1}
              placeholder="patient_id"
              value={form.patient_id}
              onChange={(e) => onChangeForm("patient_id", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              min={1}
              placeholder="doctor_id"
              value={form.doctor_id}
              onChange={(e) => onChangeForm("doctor_id", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              value={form.visit_date}
              onChange={(e) => onChangeForm("visit_date", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="diagnosis"
              value={form.diagnosis}
              onChange={(e) => onChangeForm("diagnosis", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="treatment"
              value={form.treatment}
              onChange={(e) => onChangeForm("treatment", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="note"
              value={form.note}
              onChange={(e) => onChangeForm("note", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก Medical Record"}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="flex-1 w-full sm:max-w-md">
            <input
              type="text"
              placeholder="ค้นหา patient_id, doctor_id, diagnosis, treatment, note"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchMedicalRecords}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            รีเฟรชข้อมูล
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="text-gray-600 text-sm font-medium">Medical Records ทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{records.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="text-gray-600 text-sm font-medium">พบผลการค้นหา</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{filteredRecords.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="text-gray-600 text-sm font-medium">หมายเหตุว่าง</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{records.filter((item) => !item.note).length}</div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor ID</th>
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
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-red-600">{error}</td>
                  </tr>
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{record.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.patient_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.doctor_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(record.visit_date).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.diagnosis}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.treatment}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">{record.note || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => onDeleteRecord(record.id)}
                          className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูล medical record</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">แสดงผลลัพธ์ {filteredRecords.length} จาก {records.length} รายการ</div>
      </div>
    </div>
  )
}
