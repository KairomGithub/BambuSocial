import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import { signIn } from '../lib/supabase'

export default function Login({ user }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    
    try {
      await signIn(email, password)
      router.push('/')
    } catch (error) {
      console.error('Error during login:', error)
      setError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout user={user}>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Đăng nhập</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
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
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                disabled={loading}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p>
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-green-600 hover:text-green-800">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}