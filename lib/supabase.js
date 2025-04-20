import { createClient } from '@supabase/supabase-js'

// Tạo client Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hàm đăng ký người dùng
export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      }
    }
  })
  
  if (error) throw error
  
  // Tạo profile cho người dùng mới trong bảng profiles
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: data.user.id, 
          username,
          avatar_url: `https://ui-avatars.com/api/?name=${username}&background=random`,
          created_at: new Date()
        }
      ])
    
    if (profileError) throw profileError
  }
  
  return data
}

// Hàm đăng nhập
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  return data
}

// Hàm đăng xuất
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Lấy thông tin người dùng hiện tại
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) throw error
  
  return session?.user
}

// Lấy bài đăng từ feed
export async function getPosts(limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Tạo bài đăng mới
export async function createPost(content, user_id) {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      { content, user_id, created_at: new Date() }
    ])
    .select()
  
  if (error) throw error
  return data
}

// Thích bài đăng
export async function likePost(post_id, user_id) {
  const { data, error } = await supabase
    .from('likes')
    .insert([
      { post_id, user_id }
    ])
  
  if (error) throw error
  
  // Cập nhật số lượt thích
  await supabase
    .rpc('increment_likes', { post_id_input: post_id })
  
  return data
}

// Bỏ thích bài đăng
export async function unlikePost(post_id, user_id) {
  const { data, error } = await supabase
    .from('likes')
    .delete()
    .match({ post_id, user_id })
  
  if (error) throw error
  
  // Cập nhật số lượt thích
  await supabase
    .rpc('decrement_likes', { post_id_input: post_id })
  
  return data
}

// Lấy thông tin cá nhân của người dùng
export async function getUserProfile(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      posts:posts (*)
    `)
    .eq('username', username)
    .single()
  
  if (error) throw error
  return data
}