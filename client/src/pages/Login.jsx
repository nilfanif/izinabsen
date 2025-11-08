import { useState } from 'react'
import { LogIn, UserCircle, Lock, Calendar, Clock, AlertCircle } from 'lucide-react'
import { API_URL } from '../config'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState('error') // 'error', 'pending', 'rejected'
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrorType('error')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        // Convert snake_case to camelCase for frontend
        const user = {
          ...data.user,
          employeeId: data.user.employee_id
        }
        onLogin(user)
      } else {
        setError(data.message)
        
        // Detect error type based on message
        if (data.message.includes('menunggu persetujuan')) {
          setErrorType('pending')
        } else if (data.message.includes('ditolak')) {
          setErrorType('rejected')
        } else {
          setErrorType('error')
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
      setErrorType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-4 shadow-2xl">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Kehadiran</h1>
          <p className="text-gray-600">Silakan login untuk melanjutkan</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">Username atau Email</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="Masukkan username atau email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="Masukkan password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-lg text-sm border-2 ${
                errorType === 'pending' 
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                  : errorType === 'rejected'
                  ? 'bg-red-50 border-red-300 text-red-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {errorType === 'pending' ? (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold mb-1">
                      {errorType === 'pending' 
                        ? 'Menunggu Persetujuan Admin'
                        : errorType === 'rejected'
                        ? 'Pendaftaran Ditolak'
                        : 'Login Gagal'
                      }
                    </p>
                    <p className="text-sm">
                      {error}
                    </p>
                    {errorType === 'pending' && (
                      <p className="text-xs mt-2 opacity-90">
                        💡 Akun Anda sedang dalam proses verifikasi. Silakan tunggu admin menyetujui pendaftaran Anda.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Daftar Sekarang
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
