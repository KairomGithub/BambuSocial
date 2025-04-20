import { useState } from 'react'
import { createPost } from '../lib/supabase'

export default function PostForm({ user, onPostCreated }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim() || !user) return
    
    setIsSubmitting(true)
    
    try {
      const newPost = await createPost(content, user.id)
      
      // Thêm thông tin profile vào bài đăng mới
      const enhancedPost = {
        ...newPost[0],
        profiles: {
          username: user.user_metadata?.username,
          avatar_url: user.user_metadata?.avatar_url
        }
      }
      
      onPostCreated(enhancedPost)
      setContent('')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="3"
          placeholder="Chia sẻ suy nghĩ của bạn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  )
}