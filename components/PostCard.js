import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { likePost, unlikePost } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export default function PostCard({ post, currentUser }) {
  const [likes, setLikes] = useState(post.likes_count || 0)
  const [isLiked, setIsLiked] = useState(false)
  
  // Kiểm tra xem người dùng đã thích bài đăng chưa
  useState(() => {
    const checkIfLiked = async () => {
      if (!currentUser) return
      
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', currentUser.id)
        .single()
      
      if (data && !error) {
        setIsLiked(true)
      }
    }
    
    checkIfLiked()
  }, [post.id, currentUser])
  
  const handleLike = async () => {
    if (!currentUser) return
    
    try {
      if (isLiked) {
        await unlikePost(post.id, currentUser.id)
        setLikes(likes - 1)
      } else {
        await likePost(post.id, currentUser.id)
        setLikes(likes + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center mb-3">
        <img 
          src={post.profiles?.avatar_url || 'https://via.placeholder.com/40'} 
          alt={post.profiles?.username || 'Người dùng'}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <Link 
            href={`/profile?username=${post.profiles?.username}`}
            className="font-bold hover:underline"
          >
            {post.profiles?.username || 'Người dùng'}
          </Link>
          <div className="text-gray-500 text-sm">
            {post.created_at && formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: vi
            })}
          </div>
        </div>
      </div>
      
      <div className="my-3 whitespace-pre-wrap">{post.content}</div>
      
      <div className="flex items-center mt-4 text-gray-500">
        <button 
          onClick={handleLike}
          className={`flex items-center mr-4 ${isLiked ? 'text-green-500' : ''}`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill={isLiked ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017a2 2 0 01-1.865-1.271L7 12l1.5-4M7 12l-2.25 6M8.5 8H4.249a1 1 0 01-.987-1.158l.5-3A1 1 0 014.75 3H8.5" 
            />
          </svg>
          <span>{likes}</span>
        </button>
        
        <div className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <span>{post.comments_count || 0}</span>
        </div>
      </div>
    </div>
  )
}