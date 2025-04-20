import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from '../lib/supabase'

export default function Navbar({ user }) {
  const router = useRouter()
  
  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }
  
  return (
    <nav className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold flex items-center">
          🎋 Bambu Social
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/profile" className="hover:underline">
                Hồ sơ
              </Link>
              <button 
                onClick={handleSignOut}
                className="hover:underline"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="bg-white text-green-600 px-3 py-1 rounded-full hover:bg-gray-100"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}