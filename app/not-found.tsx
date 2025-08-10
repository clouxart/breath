import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-7xl font-semibold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Page not found</p>
        <Link 
          href="/"
          className="inline-block px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
        >
          Return to Breathe
        </Link>
      </div>
    </div>
  )
}