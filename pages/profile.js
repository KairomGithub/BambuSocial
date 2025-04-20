import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import { supabase, getUserProfile } from '../lib/supabase'

export default function Profile({ user, loading }) {
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const router = useRouter()
  const { username } = router.query
  
  useEffect(() => {
    // Chuyển hướng đến trang đăng nhập nếu không có người dùng
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true)
        
        // Nếu không có username trong query, lấy profile của người dùng hiện tại
        const profileUsername = username || user?.user_metadata?.username
        
        if (!profileUsername) {
          setLoadingProfile(false)
          return
        }
        
        const profileData = await getUserProfile(profileUsername)
        setProfile(profileData)
        
        // Lấy bài đăng của người dùng
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, avatar_url)
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
        
        if (postsError) throw postsError
        setPosts(postsData || [])
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoadingProfile(false)
      }
    }
    
    if (user || username) {
      fetchProfile()
    }
  }, [user, loading, router, username])
  
  if (loading || loadingProfile) {
    return (
      <Layout user={user}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </Layout>
    )
  }
  
  if (!profile) {
    return (
      <Layout user={user}>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-bold mb-4">Không tìm thấy hồ sơ</h1>
          <p>Người dùng này không tồn tại hoặc đã bị xóa.</p>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout user={user}>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center">
          <img 
            src={profile.avatar_url || 'https://via.placeholder.com/100'} 
            alt={profile.username} 
            className="w-20 h-20 rounded-full mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p className="text-gray-600">
              Tham gia: {new Date(profile.created_at).toLocaleDateString('vi-VN')}
            </p>
            {profile.bio && <p className="mt-2">{profile.bio}</p>}
          </div>
        </div>
        
        <div className="flex mt-4 text-gray-600">
          <div className="mr-4">
            <span className="font-bold">{profile.posts?.length || posts.length}</span> bài đăng
          </div>
          <div className="mr-4">
            <span className="font-bold">{profile.followers_count || 0}</span> người theo dõi
          </div>
          <div>
            <span className="font-bold">{profile.following_count || 0}</span> đang theo dõi
          </div>
        </div>
        
        {user && user.id !== profile.id && (
          <div className="mt-4">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Theo dõi
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Bài đăng</h2>
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Chưa có bài đăng nào.
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}