import { useState, useEffect } from 'react'
import { LogOut, Plus, Calendar, Clock, FileText, CheckCircle, XCircle, AlertCircle, FileQuestion, ChevronLeft, ChevronRight, TrendingUp, Send, Info } from 'lucide-react'
import { format, subMonths, addMonths } from 'date-fns'
import { id } from 'date-fns/locale'
import Toast from '../components/Toast'
import LoadingOverlay from '../components/LoadingOverlay'

export default function EmployeeDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('form')
  const [submissions, setSubmissions] = useState([])
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [monthlyStats, setMonthlyStats] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [quotaInfo, setQuotaInfo] = useState(null)
  
  // Filter state for statistics
  const currentDate = new Date()
  const [statsMonth, setStatsMonth] = useState(currentDate.getMonth() + 1)
  const [statsYear, setStatsYear] = useState(currentDate.getFullYear())
  
  // Filter state for history (separate)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'terlambat-rekam',
    subType: '', // 'datang' atau 'pulang' untuk lupa-rekam
    date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    description: ''
  })

  useEffect(() => {
    if (user.employeeId) {
      loadEmployee()
      loadMonthlyStats(statsMonth, statsYear)
      checkQuota(formData.date)
    }
  }, [])
  
  // Reload stats when month/year changes
  useEffect(() => {
    if (user.employeeId) {
      loadMonthlyStats(statsMonth, statsYear)
    }
  }, [statsMonth, statsYear])
  
  // Reload submissions when history month/year changes
  useEffect(() => {
    if (user.employeeId) {
      loadSubmissions()
    }
  }, [selectedMonth, selectedYear])
  
  // Check quota when date changes
  useEffect(() => {
    if (user.employeeId && formData.date) {
      checkQuota(formData.date)
    }
  }, [formData.date])

  const loadEmployee = async () => {
    if (!user.employeeId) return
    
    try {
      const response = await fetch(`/api/employees/${user.employeeId}`)
      if (!response.ok) throw new Error('Failed to load employee')
      const data = await response.json()
      setEmployee(data)
    } catch (err) {
      console.error('Error loading employee:', err)
      setError('Gagal memuat data pegawai')
    }
  }

  const loadSubmissions = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/submissions?employeeId=${user.employeeId}&month=${selectedMonth}&year=${selectedYear}`)
      if (!response.ok) throw new Error('Failed to load submissions')
      const data = await response.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading submissions:', err)
      setError('Gagal memuat riwayat pengajuan')
      setSubmissions([])
    }
  }

  const loadMonthlyStats = async (month = statsMonth, year = statsYear) => {
    try {
      const response = await fetch(`/api/monthly-stats/${user.employeeId}?month=${month}&year=${year}`)
      const data = await response.json()
      setMonthlyStats(data)
    } catch (err) {
      console.error('Error loading monthly stats:', err)
    }
  }
  
  const checkQuota = async (date) => {
    try {
      const response = await fetch(`/api/quota-check?employeeId=${user.employeeId}&date=${date}`)
      const data = await response.json()
      if (data.success) {
        setQuotaInfo(data.quota)
      }
    } catch (err) {
      console.error('Error checking quota:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId,
          type: formData.type,
          subType: formData.subType || null,
          date: formData.date,
          reason: formData.reason || null,
          description: formData.description
        })
      })

      const data = await response.json()

      if (data.success) {
        setToast({ message: 'Pengajuan berhasil dikirim!', type: 'success' })
        setFormData({
          type: 'terlambat-rekam',
          subType: '',
          date: format(new Date(), 'yyyy-MM-dd'),
          reason: '',
          description: ''
        })
        // Reset ke bulan ini setelah submit
        setSelectedMonth(new Date().getMonth() + 1)
        setSelectedYear(new Date().getFullYear())
        setStatsMonth(new Date().getMonth() + 1)
        setStatsYear(new Date().getFullYear())
        loadSubmissions()
        loadMonthlyStats(new Date().getMonth() + 1, new Date().getFullYear())
        setActiveTab('history')
      } else {
        setToast({ message: data.message || 'Pengajuan gagal. Silakan coba lagi.', type: 'error' })
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
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`badge ${badge.class}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: id })
    } catch {
      return dateString || '-'
    }
  }

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm', { locale: id })
    } catch {
      return '-'
    }
  }

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: id })
    } catch {
      return '-'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      'terlambat-rekam': 'Terlambat',
      'lupa-rekam': 'Lupa Rekam'
    }
    return labels[type] || type
  }

  const getSubTypeLabel = (subType) => {
    if (!subType) return null
    return subType === 'datang' ? 'Datang' : 'Pulang'
  }

  const getReasonLabel = (reason) => {
    if (!reason) return null
    return reason.replace('-', ' ')
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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Manajemen Kehadiran</h1>
                {employee && (
                  <p className="text-sm text-gray-600">{employee.name} - {employee.nip}</p>
                )}
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
        {/* Warning jika tidak ada employeeId */}
        {!user.employeeId && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Akun Belum Lengkap
                </h3>
                <p className="text-yellow-700 mb-3">
                  Akun Anda telah disetujui oleh admin, namun data pegawai belum dilengkapi. 
                  Silakan hubungi administrator untuk melengkapi data kepegawaian Anda.
                </p>
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mt-3">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Informasi Akun:</p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>Nama:</strong> {user.name}</li>
                    <li>• <strong>Username:</strong> {user.username}</li>
                    <li>• <strong>Status:</strong> Menunggu data pegawai</li>
                  </ul>
                </div>
                <p className="text-sm text-yellow-600 mt-3 italic">
                  Anda akan dapat menggunakan sistem setelah data pegawai dilengkapi oleh admin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        {user.employeeId && (
          <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'form'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Ajukan Izin
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Riwayat Pengajuan
            </button>
          </nav>
        </div>
        )}

        {/* Form Tab */}
        {user.employeeId && activeTab === 'form' && (
          <div className="max-w-4xl mx-auto">
            {/* Monthly Statistics Card - Improved */}
            {monthlyStats && (
              <div className="mb-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Statistik Bulan Ini</h3>
                        <p className="text-primary-100 text-sm">
                          {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][statsMonth - 1]} {statsYear}
                        </p>
                      </div>
                    </div>
                    
                    {/* Month & Year Filter */}
                    <div className="flex items-center gap-2">
                      <select
                        value={statsMonth}
                        onChange={(e) => setStatsMonth(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      >
                        <option value="1" className="text-gray-900">Januari</option>
                        <option value="2" className="text-gray-900">Februari</option>
                        <option value="3" className="text-gray-900">Maret</option>
                        <option value="4" className="text-gray-900">April</option>
                        <option value="5" className="text-gray-900">Mei</option>
                        <option value="6" className="text-gray-900">Juni</option>
                        <option value="7" className="text-gray-900">Juli</option>
                        <option value="8" className="text-gray-900">Agustus</option>
                        <option value="9" className="text-gray-900">September</option>
                        <option value="10" className="text-gray-900">Oktober</option>
                        <option value="11" className="text-gray-900">November</option>
                        <option value="12" className="text-gray-900">Desember</option>
                      </select>
                      
                      <select
                        value={statsYear}
                        onChange={(e) => setStatsYear(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                      >
                        {[...Array(5)].map((_, i) => {
                          const year = currentDate.getFullYear() - i
                          return <option key={year} value={year} className="text-gray-900">{year}</option>
                        })}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-primary-100">Total Pengajuan</p>
                        <FileText className="w-5 h-5 text-white/60" />
                      </div>
                      <p className="text-3xl font-bold text-white">{monthlyStats.total}</p>
                      <p className="text-xs text-primary-100 mt-1">Semua jenis izin</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-primary-100">Kuota Gabungan</p>
                        <AlertCircle className="w-5 h-5 text-white/60" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-white">{monthlyStats.quotaUsed}</p>
                        <p className="text-xl text-primary-200">/ {monthlyStats.quotaLimit}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-white h-full rounded-full transition-all duration-300"
                            style={{ width: `${(monthlyStats.quotaUsed / monthlyStats.quotaLimit) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-primary-100 font-medium">
                          Sisa {monthlyStats.quotaRemaining}x
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-primary-100">Breakdown</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-100">Terlambat:</span>
                          <span className="text-white font-bold">{monthlyStats.terlambat}x</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-primary-100">Lupa Rekam:</span>
                          <span className="text-white font-bold">{monthlyStats.lupaRekam}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Card - Improved */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ajukan Izin Kehadiran</h2>
                    <p className="text-sm text-gray-600 mt-1">Lengkapi formulir di bawah ini dengan benar</p>
                  </div>
                </div>
              </div>
              
              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-8">
                  {/* Jenis Izin */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Jenis Izin <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Terlambat Rekam */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'terlambat-rekam', subType: '', reason: '' })}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === 'terlambat-rekam'
                            ? 'border-orange-600 bg-orange-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            formData.type === 'terlambat-rekam' ? 'bg-orange-600' : 'bg-gray-100'
                          }`}>
                            <Clock className={`w-6 h-6 ${
                              formData.type === 'terlambat-rekam' ? 'text-white' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${
                              formData.type === 'terlambat-rekam' ? 'text-orange-900' : 'text-gray-900'
                            }`}>
                              Terlambat Rekam
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Terlambat rekam kehadiran
                            </p>
                          </div>
                          {formData.type === 'terlambat-rekam' && (
                            <CheckCircle className="w-5 h-5 text-orange-600 absolute top-3 right-3" />
                          )}
                        </div>
                      </button>

                      {/* Lupa Rekam */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: 'lupa-rekam', subType: '', reason: '' })}
                        className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                          formData.type === 'lupa-rekam'
                            ? 'border-purple-600 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            formData.type === 'lupa-rekam' ? 'bg-purple-600' : 'bg-gray-100'
                          }`}>
                            <FileQuestion className={`w-6 h-6 ${
                              formData.type === 'lupa-rekam' ? 'text-white' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${
                              formData.type === 'lupa-rekam' ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              Lupa Rekam
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Lupa rekam kehadiran
                            </p>
                          </div>
                          {formData.type === 'lupa-rekam' && (
                            <CheckCircle className="w-5 h-5 text-purple-600 absolute top-3 right-3" />
                          )}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 font-medium"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Pilih tanggal kejadian yang akan diajukan izin
                    </p>
                    
                    {/* Warning untuk kuota gabungan - Real-time based on selected date */}
                    {(formData.type === 'terlambat-rekam' || formData.type === 'lupa-rekam') && quotaInfo && (
                      <div className={`mt-3 p-4 rounded-xl border-2 flex items-start gap-3 ${
                        quotaInfo.remaining > 0
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          quotaInfo.remaining > 0 ? 'text-blue-600' : 'text-red-600'
                        }`} />
                        <div className="flex-1">
                          {quotaInfo.remaining > 0 ? (
                            <div>
                              <p className="text-sm font-semibold text-blue-900">
                                Informasi Kuota - {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][quotaInfo.month - 1]} {quotaInfo.year}
                              </p>
                              <p className="text-sm text-blue-700 mt-1">
                                Kuota terpakai: <strong>{quotaInfo.used}/{quotaInfo.total}</strong> 
                                (Terlambat: {quotaInfo.breakdown.terlambat}x, Lupa: {quotaInfo.breakdown.lupaRekam}x)
                                <br />
                                Sisa kuota: <strong>{quotaInfo.remaining}x</strong>
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-red-900">Kuota Tercapai</p>
                              <p className="text-sm text-red-700 mt-1">
                                Anda telah mencapai batas maksimal 10x pengajuan (Terlambat + Lupa Rekam) untuk bulan {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][quotaInfo.month - 1]} {quotaInfo.year}.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SubType Field - Only for "lupa-rekam" */}
                  {formData.type === 'lupa-rekam' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-900">
                        Jenis Lupa Rekam <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, subType: 'datang' })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.subType === 'datang'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`font-semibold ${
                              formData.subType === 'datang' ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              Lupa Rekam Datang
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Lupa absen saat datang</p>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, subType: 'pulang' })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.subType === 'pulang'
                              ? 'border-purple-600 bg-purple-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <p className={`font-semibold ${
                              formData.subType === 'pulang' ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              Lupa Rekam Pulang
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Lupa absen saat pulang</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Keterangan */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      {formData.type === 'terlambat-rekam' ? 'Alasan Terlambat' : formData.type === 'lupa-rekam' ? 'Alasan Lupa Rekam' : 'Keterangan Detail'} 
                      <span className="text-red-500"> *</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 resize-none"
                      rows="5"
                      placeholder={
                        formData.type === 'terlambat-rekam' 
                          ? 'Contoh: Saya terlambat rekam kehadiran karena menghadiri rapat mendadak di kantor cabang...'
                          : formData.type === 'lupa-rekam'
                          ? 'Contoh: Saya lupa melakukan rekam kehadiran karena terburu-buru...'
                          : 'Contoh: Saya tidak dapat melakukan rekam kehadiran karena sedang sakit dan dirawat di rumah sakit...'
                      }
                      required
                    ></textarea>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Jelaskan dengan detail dan jelas agar mudah dipahami
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || ((formData.type === 'terlambat-rekam' || formData.type === 'lupa-rekam') && quotaInfo && quotaInfo.remaining <= 0) || (formData.type === 'lupa-rekam' && !formData.subType)}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center justify-center gap-3 text-lg"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Mengirim...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Kirim Pengajuan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* History Tab */}
        {user.employeeId && activeTab === 'history' && (
          <div className="max-w-7xl mx-auto">
            {/* Header with Month Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Riwayat Pengajuan</h2>
                    <p className="text-sm text-gray-600 mt-1">Total: {submissions.length} pengajuan</p>
                  </div>
                </div>
                
                {/* Month Filter */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const prevDate = subMonths(new Date(selectedYear, selectedMonth - 1), 1)
                      setSelectedMonth(prevDate.getMonth() + 1)
                      setSelectedYear(prevDate.getFullYear())
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="px-4 py-2 bg-primary-50 border-2 border-primary-200 rounded-lg min-w-[150px] text-center">
                    <p className="text-sm font-semibold text-primary-900">
                      {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy', { locale: id })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      const nextDate = addMonths(new Date(selectedYear, selectedMonth - 1), 1)
                      setSelectedMonth(nextDate.getMonth() + 1)
                      setSelectedYear(nextDate.getFullYear())
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedMonth(new Date().getMonth() + 1)
                      setSelectedYear(new Date().getFullYear())
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Bulan Ini
                  </button>
                </div>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Pengajuan</h3>
                <p className="text-gray-500 text-sm">Anda belum pernah mengajukan izin kehadiran</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Jenis Izin
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Alasan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {formatDate(submission.date)}
                                </div>
                                {submission.submittedAt && (
                                  <div className="text-xs text-gray-500">
                                    {formatTime(submission.submittedAt)}
                                  </div>
                                )}
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
                                <div className="text-sm font-medium text-gray-900">
                                  {getTypeLabel(submission.type)}
                                </div>
                                {getReasonLabel(submission.reason) && (
                                  <div className="text-xs text-gray-500 capitalize">
                                    {getReasonLabel(submission.reason)}
                                  </div>
                                )}
                                {getSubTypeLabel(submission.subType) && (
                                  <div className="text-xs text-gray-500">
                                    {getSubTypeLabel(submission.subType)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs">
                              <p className="line-clamp-2">{submission.description || '-'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(submission.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && <LoadingOverlay message="Mengirim pengajuan..." />}

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
