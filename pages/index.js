import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import PostCard from '../components/PostCard'
import PostForm from '../components/PostForm'
import { getPosts } from '../lib/supabase'

export default function Home({ user, loading }) {
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Chuyển hướng đến trang đăng nhập nếu không có người dùng
    if (!loading && !user) {
      router.push('/login')
      return
    }
    
    // Lấy danh sách bài đăng
    const fetchPosts = async () => {
      try {
        const postsData = await getPosts(20)
        setPosts(postsData)
      } catch (error) {
        console.error('Error fetching posts:', error)
      } finally {
        setLoadingPosts(false)
      }
    }
    
    if (user) {
      fetchPosts()
    }
  }, [user, loading, router])
  
  const handleNewPost = (newPost) => {
    setPosts([newPost, ...posts])
  }
  
  if (loading || loadingPosts) {
    return (
      <Layout user={user}>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout user={user}>
      <h1 className="text-2xl font-bold mb-6">Bảng tin</h1>
      
      <PostForm user={user} onPostCreated={handleNewPost} />
      
      <div className="mt-8 space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={user} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            Chưa có bài đăng nào. Hãy là người đầu tiên đăng bài!
          </div>
        )}
      </div>
    </Layout>
  )
}