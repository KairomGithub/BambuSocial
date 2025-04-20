import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Chưa xác thực' })
  }
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Token không hợp lệ' })
  }
  
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'PUT':
      return handleUpdate(req, res, user)
    default:
      return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }
}

// Xử lý GET request - Lấy thông tin người dùng
async function handleGet(req, res) {
  const { username } = req.query
  
  if (!username) {
    return res.status(400).json({ error: 'Thiếu tên người dùng' })
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Không tìm thấy người dùng' })
      }
      throw error
    }
    
    // Lấy số lượng bài đăng
    const { count: postCount, error: postError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', data.id)
    
    if (postError) throw postError
    
    // Lấy số lượng người theo dõi
    const { count: followerCount, error: followerError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', data.id)
    
    if (followerError) throw followerError
    
    // Lấy số lượng đang theo dõi
    const { count: followingCount, error: followingError } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', data.id)
    
    if (followingError) throw followingError
    
    return res.status(200).json({
      ...data,
      post_count: postCount,
      follower_count: followerCount,
      following_count: followingCount
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' })
  }
}

// Xử lý PUT request - Cập nhật thông tin người dùng
async function handleUpdate(req, res, user) {
  const { bio, avatar_url } = req.body
  
  const updates = {}
  if (bio !== undefined) updates.bio = bio
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Không có dữ liệu cập nhật' })
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
    
    if (error) throw error
    
    return res.status(200).json(data[0])
  } catch (error) {
    console.error('Error updating user profile:', error)
    return res.status(500).json({ error: 'Lỗi khi cập nhật thông tin người dùng' })
  }
}