import { useState, useEffect } from 'react'
import { Users, Calendar, Clock, FileText, XCircle, FileQuestion, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function SubmissionsTable({ submissions, onReview, getStatusBadge }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const itemsPerPage = 30

  // Filter submissions based on search query
  const filteredSubmissions = submissions.filter(submission => {
    const query = searchQuery.toLowerCase()
    return (
      submission.employeeName?.toLowerCase().includes(query) ||
      submission.employeeNip?.toLowerCase().includes(query) ||
      submission.department?.toLowerCase().includes(query) ||
      submission.description?.toLowerCase().includes(query)
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex)

  // Reset to page 1 when search query or submissions change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, submissions.length])

  if (submissions.length === 0) {
    return (
      <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Pengajuan</h3>
        <p className="text-gray-500 text-sm">Belum ada pengajuan izin untuk status ini</p>
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
            placeholder="Cari pegawai (nama, NIP, bagian, keterangan)..."
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
            Ditemukan <span className="font-semibold">{filteredSubmissions.length}</span> dari {submissions.length} data
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Pegawai
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Jenis Izin
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Keterangan
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
            {currentSubmissions.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Tidak ada hasil untuk "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-1">Coba kata kunci lain</p>
                </td>
              </tr>
            ) : (
              currentSubmissions.map((submission, index) => (
              <tr 
                key={submission.id} 
                className={`hover:bg-primary-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{submission.employeeName}</p>
                      <p className="text-xs text-gray-600">{submission.employeeNip}</p>
                      <p className="text-xs text-gray-500">{submission.department}</p>
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
                        {submission.type === 'terlambat-rekam' 
                          ? 'Terlambat' 
                          : 'Lupa Rekam'}
                      </p>
                      {submission.subType && (
                        <p className="text-xs text-gray-500">
                          ({submission.subType === 'datang' ? 'Datang' : 'Pulang'})
                        </p>
                      )}
                      {submission.reason && (
                        <p className="text-xs text-gray-500 capitalize">
                          {submission.reason.replace('-', ' ')}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(submission.date), 'dd MMM yyyy', { locale: id })}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(submission.submittedAt), 'HH:mm', { locale: id })}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                    {submission.description}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(submission.status)}
                  {submission.status !== 'pending' && submission.reviewedBy && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">oleh {submission.reviewedBy}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(submission.reviewedAt), 'dd/MM HH:mm', { locale: id })}
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {submission.status === 'pending' ? (
                    <button
                      onClick={() => onReview(submission)}
                      className="btn btn-primary btn-sm inline-flex items-center gap-1 hover:scale-105 transition-transform"
                    >
                      <FileText className="w-3 h-3" />
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
            Menampilkan <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredSubmissions.length)}</span> dari <span className="font-medium">{filteredSubmissions.length}</span> data
            {searchQuery && <span className="text-gray-500"> (difilter dari {submissions.length})</span>}
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
