import { useState, useEffect } from 'react'
import { UserPlus, Mail, Users, Briefcase, Building2, Calendar, Clock, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function RegistrationsTable({ registrations, onReview, getStatusBadge }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 30

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter(registration => {
    const query = searchQuery.toLowerCase()
    return (
      registration.name?.toLowerCase().includes(query) ||
      registration.nip?.toLowerCase().includes(query) ||
      registration.email?.toLowerCase().includes(query) ||
      registration.username?.toLowerCase().includes(query) ||
      registration.position?.toLowerCase().includes(query) ||
      registration.department?.toLowerCase().includes(query)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex)

  // Reset to page 1 when search query or registrations change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, registrations.length])

  if (registrations.length === 0) {
    return (
      <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Pendaftaran</h3>
        <p className="text-gray-500 text-sm">Belum ada pendaftaran pegawai baru untuk status ini</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden p-0">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pegawai (nama, NIP, email, username, jabatan, bagian)..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            Ditemukan <span className="font-semibold">{filteredRegistrations.length}</span> dari {registrations.length} data
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Nama & NIP
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Email & Username
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Jabatan & Bagian
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Tanggal Daftar
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRegistrations.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Tidak ada hasil untuk "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain</p>
                </td>
              </tr>
            ) : (
              currentRegistrations.map((registration, index) => (
              <tr 
                key={registration.id} 
                className={`hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{registration.name}</p>
                      <p className="text-xs text-gray-600">NIP: {registration.nip}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {registration.email}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {registration.username}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {registration.position}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {registration.department}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(registration.created_at), 'dd MMM yyyy', { locale: id })}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(registration.created_at), 'HH:mm', { locale: id })}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(registration.status)}
                  {registration.status !== 'pending' && registration.reviewed_at && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        {format(new Date(registration.reviewed_at), 'dd/MM HH:mm', { locale: id })}
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {registration.status === 'pending' ? (
                    <button
                      onClick={() => onReview(registration)}
                      className="btn btn-primary btn-sm inline-flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <UserPlus className="w-3 h-3" />
                      Review
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Selesai</span>
                  )}
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
            Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredRegistrations.length)}</span> dari <span className="font-medium">{filteredRegistrations.length}</span> data
            {searchQuery && <span className="text-gray-500"> (difilter dari {registrations.length})</span>}
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
                // Show first page, last page, current page, and pages around current
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
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
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
  )
}
