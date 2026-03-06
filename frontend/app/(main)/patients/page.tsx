"use client"
import PateintRegist from "../../../components/feature/PateintRegist"
import Header from "../../../components/layout/Header"
import { useState } from "react"

// Mock data - ในอนาคตจะดึงจาก API
const mockPatients = [
    { id: 1, name: "สมชาย ใจดี", age: 45, gender: "ชาย", phone: "081-234-5678", lastVisit: "2026-03-01" },
    { id: 2, name: "สมหญิง รักเรียน", age: 32, gender: "หญิง", phone: "082-345-6789", lastVisit: "2026-03-02" },
    { id: 3, name: "วิชัย มั่นคง", age: 58, gender: "ชาย", phone: "083-456-7890", lastVisit: "2026-02-28" },
    { id: 4, name: "นงนุช สวยงาม", age: 28, gender: "หญิง", phone: "084-567-8901", lastVisit: "2026-03-03" },
]

const PatientPage = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const filteredPatients = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <Header title="จัดการข้อมูลผู้ป่วย" description="จัดการและติดตามข้อมูลผู้ป่วยทั้งหมด" />

                {/* Action Bar */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex-1 w-full sm:max-w-md">
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อผู้ป่วยหรือเบอร์โทร..."
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <div className="text-gray-600 text-sm font-medium">ผู้ป่วยทั้งหมด</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{mockPatients.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                        <div className="text-gray-600 text-sm font-medium">เข้ารับการรักษาวันนี้</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                        <div className="text-gray-600 text-sm font-medium">นัดหมายที่รอ</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                        <div className="text-gray-600 text-sm font-medium">ผู้ป่วยใหม่เดือนนี้</div>
                        <div className="text-2xl font-bold text-gray-800 mt-1">0</div>
                    </div>
                </div>

                {/* Patients Table */}
                <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ชื่อ-นามสกุล
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        อายุ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        เพศ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        เบอร์โทร
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        เข้ารักษาล่าสุด
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        การจัดการ
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{patient.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.age} ปี
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.gender}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.phone}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {patient.lastVisit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                                                        ดู
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 font-medium">
                                                        แก้ไข
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800 font-medium">
                                                        ลบ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            ไม่พบข้อมูลผู้ป่วย
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Total Results */}
                <div className="mt-4 text-sm text-gray-600">
                    แสดงผลลัพธ์ {filteredPatients.length} จาก {mockPatients.length} รายการ
                </div>
            </div>

            <PateintRegist open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    )
}
export default PatientPage