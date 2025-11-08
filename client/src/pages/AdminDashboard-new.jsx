import { useState, useEffect } from 'react'
import { LogOut, Users, FileText, CheckCircle, XCircle, AlertCircle, Calendar, Clock, TrendingUp, FileQuestion, UserPlus, Mail, Briefcase, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pending')
  const [mainTab, setMainTab] = useState('submissions') // 'submissions' or 'registrations'
  const [submissions, setSubmissions] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (mainTab === 'submissions') {
      loadSubmissions()
      loadStats()
    } else {
      loadRegistrations()
    }
  }, [activeTab, mainTab])

  const loadSubmissions = async () => {
    try {
      const status = activeTab === 'all' ? '' : activeTab
      const response = await fetch(`/api/submissions?status=${status}`)
      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      console.error('Error loading submissions:', err)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/statistics')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const loadRegistrations = async () => {
    try {
      const status = activeTab === 'all' ? '' : activeTab
      const response = await fetch(`/api/registration-requests?status=${status}`)
      const data = await response.json()
      setRegistrations(data)
    } catch (err) {
      console.error('Error loading registrations:', err)
    }
  }

  const handleReview = async (submissionId, status) => {
    if (!reviewNote.trim()) {
      alert('Silakan masukkan catatan review')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNote,
          reviewedBy: user.name
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Pengajuan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`)
        setSelectedSubmission(null)
        setReviewNote('')
        loadSubmissions()
        loadStats()
      }
    } catch (err) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationReview = async (registrationId, action) => {
    if (action === 'reject' && !reviewNote.trim()) {
      alert('Silakan masukkan alasan penolakan')
      return
    }

    const confirmMessage = action === 'approve' 
      ? 'Apakah Anda yakin ingin menyetujui pendaftaran ini?'
      : 'Apakah Anda yakin ingin menolak pendaftaran ini?'
    
    if (!confirm(confirmMessage)) return

    setLoading(true)
    try {
      const response = await fetch(`/api/registration-requests/${registrationId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvedBy: user.id,
          rejectedBy: user.id,
          reviewNote: reviewNote || (action === 'approve' ? 'Disetujui' : '')
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(action === 'approve' 
          ? 'Pendaftaran berhasil disetujui! Pegawai sekarang bisa login.'
          : 'Pendaftaran ditolak.')
        setSelectedRegistration(null)
        setReviewNote('')
        loadRegistrations()
      } else {
        alert(data.message || 'Terjadi kesalahan')
      }
    } catch (err) {
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', icon: AlertCircle, text: 'Menunggu' },
      approved: { class: 'badge-approved', icon: CheckCircle, text: 'Disetujui' },
      rejected: { class: 'badge-rejected', icon: XCircle, text: 'Ditolak' }
    }
    const badge = badges[status]
    const Icon = badge.icon
    return (
      <span className={`badge ${badge.class}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">{user.name}</p>
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-secondary flex items-center gap-2 hover:scale-105 transition-transform">
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Pengajuan
                </p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">Semua status</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Menunggu
                </p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                <p className="text-xs text-yellow-600 mt-1">Perlu review</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Disetujui
                </p>
                <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                <p className="text-xs text-green-600 mt-1">Sudah diproses</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Ditolak
                </p>
                <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                <p className="text-xs text-red-600 mt-1">Tidak disetujui</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg">
                <XCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => { setMainTab('submissions'); setActiveTab('pending'); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  mainTab === 'submissions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Pengajuan Izin
              </button>
              <button
                onClick={() => { setMainTab('registrations'); setActiveTab('pending'); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  mainTab === 'registrations'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserPlus className="w-5 h-5 inline mr-2" />
                Pendaftaran Pegawai
                {registrations.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {registrations.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <AlertCircle className="w-5 h-5 inline mr-2" />
              Menunggu {mainTab === 'submissions' && `(${stats.pending})`}
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'approved'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Disetujui
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rejected'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <XCircle className="w-5 h-5 inline mr-2" />
              Ditolak
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Semua
            </button>
          </nav>
        </div>

        {/* Content */}
        {mainTab === 'submissions' ? (
          /* Submissions Table */
          submissions.length === 0 ? (
            <div className="card text-center py-16 bg-gradient-to-br from-gray-50 to-white">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Pengajuan</h3>
              <p className="text-gray-500 text-sm">Belum ada pengajuan izin untuk status ini</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
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
                    {submissions.map((submission, index) => (
                      <tr key={submission.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
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
                            {submission.type === 'tidak-rekam' ? (
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <XCircle className="w-4 h-4 text-blue-600" />
                              </div>
                            ) : submission.type === 'terlambat-rekam' ? (
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
                                {submission.type === 'tidak-rekam' ? 'Tidak Rekam' : submission.type === 'terlambat-rekam' ? 'Terlambat' : 'Lupa Rekam'}
                              </p>
                              {submission.subType && (
                                <p className="text-xs text-gray-500">({submission.subType === 'datang' ? 'Datang' : 'Pulang'})</p>
                              )}
                              {submission.reason && (
                                <p className="text-xs text-gray-500 capitalize">{submission.reason.replace('-', ' ')}</p>
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
                              <p className="text-xs text-gray-500">{format(new Date(submission.reviewedAt), 'dd/MM HH:mm', { locale: id })}</p>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {submission.status === 'pending' ? (
                            <button
                              onClick={() => setSelectedSubmission(submission)}
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
                    ))}
                  </tbody>
                </table>
              </div>
