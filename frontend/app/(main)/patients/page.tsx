"use client"

import { getPatients } from "@/lib/api"
import PateintRegist from "../../../components/feature/PateintRegist"
import Header from "../../../components/layout/Header"
import { useEffect, useMemo, useState } from "react"

type Patient = {
    id: number
    first_name: string
    last_name: string
    age: number
    gender: string
    personal_id: string
    pharmacist_history: string[]
    disease_history: string[]
}

const PatientPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [patients, setPatients] = useState<Patient[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchPatients = async () => {
        try {
            setIsLoading(true)
            setError("")
            const data = await getPatients()
            setPatients(Array.isArray(data) ? data : [])
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch patients"
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPatients()
    }, [])

    const filteredPatients = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()
        if (!q) return patients

        return patients.filter((patient) => {
            const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase()
            return fullName.includes(q) || patient.personal_id.includes(searchTerm)
        })
    }, [patients, searchTerm])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <Header title="จัดการข้อมูลผู้ป่วย" description="จัดการและติดตามข้อมูลผู้ป่วยทั้งหมด" />

                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex-1 w-full sm:max-w-md">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อผู้ป่วยหรือเลขบัตรประชาชน..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        เพิ่มผู้ป่วยใหม่
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="text-gray-600 text-sm font-medium">ผู้ป่วยทั้งหมด</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{patients.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="text-gray-600 text-sm font-medium">เพศชาย</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{patients.filter((p) => p.gender === "male").length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                        <div className="text-gray-600 text-sm font-medium">เพศหญิง</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{patients.filter((p) => p.gender === "female").length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="text-gray-600 text-sm font-medium">อื่นๆ</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{patients.filter((p) => p.gender === "other").length}</div>
                    </div>
                </div>

{/* table */}
                <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อายุ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เพศ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">เลขบัตรประชาชน</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประวัติโรค</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แพ้ยา</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">กำลังโหลดข้อมูล...</td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-red-600">{error}</td>
                                    </tr>
                                ) : filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{patient.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{patient.first_name} {patient.last_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.age} ปี</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.gender === "male" ? "ชาย" : patient.gender === "female" ? "หญิง" : "อื่นๆ"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{patient.personal_id}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">{patient.disease_history?.length ? patient.disease_history.join(", ") : "-"}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">{patient.pharmacist_history?.length ? patient.pharmacist_history.join(", ") : "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">ไม่พบข้อมูลผู้ป่วย</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">แสดงผลลัพธ์ {filteredPatients.length} จาก {patients.length} รายการ</div>
            </div>

            <PateintRegist open={isDialogOpen} onOpenChange={setIsDialogOpen} onCreated={fetchPatients} />
        </div>
    )
}

export default PatientPage
