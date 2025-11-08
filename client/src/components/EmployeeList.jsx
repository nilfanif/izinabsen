import { useState, useEffect } from 'react'
import { Users, Search, XCircle, Calendar, Clock, FileQuestion, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import Toast from './Toast'
import LoadingOverlay from './LoadingOverlay'
import ConfirmModal from './ConfirmModal'

export default function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeSubmissions, setEmployeeSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 30
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  
  // Filter bulan untuk detail pegawai
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      const data = await response.json()
      setEmployees(data)
    } catch (err) {
      console.error('Error loading employees:', err)
    }
  }

  const loadEmployeeSubmissions = async (employeeId, month = selectedMonth, year = selectedYear) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/submissions?employeeId=${employeeId}&month=${month}&year=${year}`)
      const data = await response.json()
      setEmployeeSubmissions(data)
    } catch (err) {
      console.error('Error loading submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee)
    // Reset to current month when viewing employee
    const now = new Date()
    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
    loadEmployeeSubmissions(employee.id, now.getMonth() + 1, now.getFullYear())
  }
  
  const handleDeleteClick = (employee) => {
    setConfirmDelete(employee)
  }
  
  const handleDeleteEmployee = async () => {
    if (!confirmDelete) return
    
    const { id: employeeId } = confirmDelete
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setToast({ message: 'Pegawai berhasil dihapus', type: 'success' })
        loadEmployees()
        if (selectedEmployee && selectedEmployee.id === employeeId) {
          setSelectedEmployee(null)
        }
      } else {
        setToast({ message: data.message || 'Gagal menghapus pegawai', type: 'error' })
      }
    } catch (err) {
      console.error('Error deleting employee:', err)
      setToast({ message: 'Terjadi kesalahan saat menghapus pegawai', type: 'error' })
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }
  
  // Reload when month/year changes
  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeSubmissions(selectedEmployee.id, selectedMonth, selectedYear)
    }
  }, [selectedMonth, selectedYear])

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Menunggu
        </span>
      ),
      approved: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Disetujui
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Ditolak
        </span>
      )
    }
    return badges[status] || null
  }

  // Filter employees
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase()
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.nip?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  if (selectedEmployee) {
    return (
      <div className="space-y-6">
        {/* Back Button & Employee Info */}
        <div className="card">
          <button
            onClick={() => {
              setSelectedEmployee(null)
              setEmployeeSubmissions([])
            }}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Kembali ke Daftar Pegawai
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                <span>NIP: {selectedEmployee.nip}</span>
                <span>•</span>
                <span>{selectedEmployee.position}</span>
                <span>•</span>
                <span>{selectedEmployee.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions History */}
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Riwayat Pengajuan</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {employeeSubmissions.length} pengajuan
                </p>
              </div>
              
              {/* Month & Year Filter */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Bulan:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Tahun:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = currentDate.getFullYear() - i
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : employeeSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada riwayat pengajuan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Tanggal</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Jenis Izin</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Keterangan</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeeSubmissions.map((submission, index) => (
                    <tr key={submission.id} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {format(new Date(submission.date), 'dd MMM yyyy', { locale: id })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(submission.submittedAt), 'HH:mm', { locale: id })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {submission.type === 'terlambat-rekam' ? (
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-orange-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <FileQuestion className="w-4 h-4 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {submission.type === 'terlambat-rekam' ? 'Terlambat' : 'Lupa Rekam'}
                            </p>
                            {submission.subType && (
                              <p className="text-xs text-gray-500">
                                ({submission.subType === 'datang' ? 'Datang' : 'Pulang'})
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {submission.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(submission.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Daftar Pegawai</h2>
            <p className="text-sm text-gray-600">Kelola dan lihat riwayat pengajuan pegawai</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pegawai (nama, NIP, jabatan, bagian)..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2">
            Ditemukan <span className="font-semibold">{filteredEmployees.length}</span> dari {employees.length} pegawai
          </p>
        )}
      </div>

      {/* Employee List */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Nama & NIP</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Jabatan</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase">Bagian</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Tidak ada data pegawai'}
                    </p>
                  </td>
                </tr>
              ) : (
                currentEmployees.map((employee, index) => (
                  <tr key={employee.id} className={`hover:bg-primary-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{employee.name}</p>
                          <p className="text-xs text-gray-600">NIP: {employee.nip}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{employee.position}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{employee.department}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewEmployee(employee)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleDeleteClick(employee)}
                          disabled={deleting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Hapus Pegawai"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredEmployees.length)}</span> dari <span className="font-medium">{filteredEmployees.length}</span> pegawai
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${
                  currentPage === 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-500">...</span>
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${
                  currentPage === totalPages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteEmployee}
        title="Hapus Pegawai"
        message={
          confirmDelete 
            ? `Apakah Anda yakin ingin menghapus pegawai "${confirmDelete.name}"? Semua data pengajuan pegawai ini juga akan terhapus dan tidak dapat dikembalikan.`
            : ''
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />
      
      {/* Loading Overlay */}
      {deleting && <LoadingOverlay message="Menghapus pegawai..." />}
    </div>
  )
}
