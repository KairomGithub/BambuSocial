import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import { signUp } from '../lib/supabase'

export default function Register({ user }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    // Kiểm tra tên người dùng (chỉ chứa chữ cái, số và dấu gạch dưới)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới.')
      setLoading(false)
      return
    }
    
    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      setLoading(false)
      return
    }
    
    try {
      await signUp(email, password, username)
      router.push('/login?registered=true')
    } catch (error) {
      console.error('Error during registration:', error)
      setError('Đăng ký thất bại. Email có thể đã được sử dụng hoặc tên người dùng đã tồn tại.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout user={user}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tên người dùng
              </label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vd: nguyen_van_a"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p>
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-green-600 hover:text-green-800">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}