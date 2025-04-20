import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Kiểm tra phiên người dùng khi tải ứng dụng
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
      
      // Lắng nghe các thay đổi auth
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user || null)
        }
      )
      
      return () => {
        authListener?.subscription?.unsubscribe()
      }
    }
    
    getSession()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen">
      <Component {...pageProps} user={user} loading={loading} />
    </div>
  )
}

export default MyApp