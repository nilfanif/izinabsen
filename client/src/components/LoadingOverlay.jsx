import { Loader2 } from 'lucide-react'

export default function LoadingOverlay({ message = 'Memproses...' }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-fadeIn">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full"></div>
          {/* Spinning ring */}
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
          {/* Inner icon */}
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary-600 animate-pulse" />
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  )
}
