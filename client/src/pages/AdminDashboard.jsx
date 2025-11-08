import { useState, useEffect } from 'react'
import { LogOut, Users, FileText, CheckCircle, XCircle, AlertCircle, TrendingUp, UserPlus } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import SubmissionsTable from '../components/SubmissionsTable'
import RegistrationsTable from '../components/RegistrationsTable'
import EmployeeList from '../components/EmployeeList'
import Toast from '../components/Toast'
import LoadingOverlay from '../components/LoadingOverlay'
import ConfirmModal from '../components/ConfirmModal'

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('pending')
  const [mainTab, setMainTab] = useState('submissions') // 'submissions', 'registrations', or 'employees'
  const [submissions, setSubmissions] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [registrationStats, setRegistrationStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { type: 'approve'/'reject', registration: {...} }

  // Load initial data on mount
  useEffect(() => {
    loadStats()
    loadRegistrationStats()
  }, [])

  useEffect(() => {
    if (mainTab === 'submissions') {
      loadSubmissions()
    } else if (mainTab === 'registrations') {
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

  const loadRegistrationStats = async () => {
    try {
      const response = await fetch('/api/registration-requests?status=')
      const data = await response.json()
      
      // Calculate stats from all registrations
      const stats = {
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        approved: data.filter(r => r.status === 'approved').length,
        rejected: data.filter(r => r.status === 'rejected').length
      }
      setRegistrationStats(stats)
    } catch (err) {
      console.error('Error loading registration stats:', err)
    }
  }

  const loadRegistrations = async () => {
    try {
      const status = activeTab === 'all' ? '' : activeTab
      const response = await fetch(`/api/registration-requests?status=${status}`)
      const data = await response.json()
      setRegistrations(data)
      
      // Also update stats when loading registrations
      if (activeTab === 'all' || !status) {
        const stats = {
          total: data.length,
          pending: data.filter(r => r.status === 'pending').length,
          approved: data.filter(r => r.status === 'approved').length,
          rejected: data.filter(r => r.status === 'rejected').length
        }
        setRegistrationStats(stats)
      }
    } catch (err) {
      console.error('Error loading registrations:', err)
    }
  }

  const handleReview = async (submissionId, status) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNote: null,
          reviewedBy: user.name
        })
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: `Pengajuan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`, type: 'success' })
        setSelectedSubmission(null)
        setReviewNote('')
        loadSubmissions()
        loadStats()
      }
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationReview = async (registrationId, action) => {
    if (action === 'reject' && !reviewNote.trim()) {
      setToast({ message: 'Silakan masukkan alasan penolakan', type: 'warning' })
      return
    }

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
        setToast({ 
          message: action === 'approve' 
            ? 'Pendaftaran berhasil disetujui! Pegawai sekarang bisa login.'
            : 'Pendaftaran ditolak.',
          type: 'success'
        })
        setSelectedRegistration(null)
        setReviewNote('')
        setConfirmAction(null)
        loadRegistrations()
        loadRegistrationStats() // Reload stats to update badge
      } else {
        setToast({ message: data.message || 'Terjadi kesalahan', type: 'error' })
      }
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' })
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manajemen Kehadiran</h1>
                <p className="text-sm text-gray-600">{user.name} • Admin</p>
              </div>
            </div>
            <button onClick={onLogout} className="btn btn-secondary flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Card - Modern Design */}
        <div className="mb-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Statistik Pengajuan</h3>
                <p className="text-primary-100 text-sm">
                  {format(new Date(), 'MMMM yyyy', { locale: id })}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-100">Total Pengajuan</p>
                  <FileText className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-primary-100 mt-1">Semua pengajuan</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-100">Menunggu</p>
                  <AlertCircle className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
                <p className="text-xs text-primary-100 mt-1">Perlu direview</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-100">Disetujui</p>
                  <CheckCircle className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.approved}</p>
                <p className="text-xs text-primary-100 mt-1">Telah disetujui</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-100">Ditolak</p>
                  <XCircle className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                <p className="text-xs text-primary-100 mt-1">Telah ditolak</p>
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
                {registrationStats.pending > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {registrationStats.pending}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMainTab('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  mainTab === 'employees'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Daftar Pegawai
              </button>
            </nav>
          </div>
        </div>

        {/* Sub Tabs - Hide for employees tab */}
        {mainTab !== 'employees' && (
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
        )}

        {/* Content */}
        {mainTab === 'submissions' ? (
          <SubmissionsTable 
            submissions={submissions}
            onReview={setSelectedSubmission}
            getStatusBadge={getStatusBadge}
          />
        ) : mainTab === 'registrations' ? (
          <RegistrationsTable 
            registrations={registrations}
            onReview={setSelectedRegistration}
            getStatusBadge={getStatusBadge}
          />
        ) : (
          <EmployeeList />
        )}
      </div>

      {/* Submission Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white pr-8">Review Pengajuan</h3>
              <button
                onClick={() => {
                  setSelectedSubmission(null)
                  setReviewNote('')
                }}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* Pegawai Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedSubmission.employeeName}</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.employeeNip} • {selectedSubmission.department}</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">JENIS IZIN</p>
                  <p className="font-semibold text-gray-900">
                    {selectedSubmission.type === 'terlambat-rekam' ? 'Terlambat Rekam' : 'Lupa Rekam'}
                    {selectedSubmission.subType && ` (${selectedSubmission.subType === 'datang' ? 'Datang' : 'Pulang'})`}
                  </p>
                </div>
                
                {selectedSubmission.reason && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-1">ALASAN</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedSubmission.reason.replace('-', ' ')}</p>
                  </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">TANGGAL</p>
                  <p className="font-medium text-gray-900">{format(new Date(selectedSubmission.date), 'dd MMM yyyy', { locale: id })}</p>
                </div>
                
                <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">KETERANGAN</p>
                  <p className="text-gray-900">{selectedSubmission.description}</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-2">
              <button
                onClick={() => handleReview(selectedSubmission.id, 'approved')}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Proses...' : 'Setujui'}
              </button>
              <button
                onClick={() => handleReview(selectedSubmission.id, 'rejected')}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {loading ? 'Proses...' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Registration Review Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-bold text-white pr-8">Review Pendaftaran</h3>
              <button
                onClick={() => {
                  setSelectedRegistration(null)
                  setReviewNote('')
                }}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[calc(90vh-180px)] overflow-y-auto">
              {/* User Info */}
              <div className="flex items-center gap-3 pb-4 border-b">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{selectedRegistration.name}</p>
                  <p className="text-sm text-gray-600">NIP: {selectedRegistration.nip}</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">EMAIL</p>
                  <p className="font-medium text-gray-900 break-all">{selectedRegistration.email}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">USERNAME</p>
                  <p className="font-medium text-gray-900">{selectedRegistration.username}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">JABATAN</p>
                  <p className="font-medium text-gray-900">{selectedRegistration.position}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium mb-1">BAGIAN</p>
                  <p className="font-medium text-gray-900">{selectedRegistration.department}</p>
                </div>
                
                <div className="col-span-2 bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">TANGGAL DAFTAR</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(selectedRegistration.created_at), 'dd MMMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
              </div>

              {/* Review Note */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Catatan Review {' '}
                  <span className="text-gray-500 font-normal text-xs">(Wajib untuk Tolak)</span>
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Tulis catatan review..."
                ></textarea>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-2">
              <button
                onClick={() => setConfirmAction({ type: 'approve', registration: selectedRegistration })}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Setujui
              </button>
              <button
                onClick={() => setConfirmAction({ type: 'reject', registration: selectedRegistration })}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            handleRegistrationReview(confirmAction.registration.id, confirmAction.type)
          }
        }}
        title={confirmAction?.type === 'approve' ? 'Setujui Pendaftaran' : 'Tolak Pendaftaran'}
        message={
          confirmAction?.type === 'approve'
            ? `Apakah Anda yakin ingin menyetujui pendaftaran "${confirmAction?.registration?.name}"? Pegawai ini akan dapat login ke sistem.`
            : `Apakah Anda yakin ingin menolak pendaftaran "${confirmAction?.registration?.name}"? ${!reviewNote.trim() ? 'Silakan isi catatan review terlebih dahulu.' : ''}`
        }
        confirmText={confirmAction?.type === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
        cancelText="Batal"
        type={confirmAction?.type === 'approve' ? 'info' : 'danger'}
      />

      {/* Loading Overlay */}
      {loading && <LoadingOverlay message="Memproses..." />}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
