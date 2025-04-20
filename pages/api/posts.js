import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  // Lấy token từ header
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Chưa xác thực' })
  }
  
  // Lấy thông tin người dùng từ token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Token không hợp lệ' })
  }
  
  // Xử lý các phương thức request
  switch (req.method) {
    case 'GET':
      return handleGet(req, res)
    case 'POST':
      return handlePost(req, res, user)
    default:
      return res.status(405).json({ error: 'Phương thức không được hỗ trợ' })
  }
}

// Xử lý GET request - Lấy danh sách bài đăng
async function handleGet(req, res) {
  const { limit = 20, offset = 0 } = req.query
  
  try {
    const { data, error, count } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
    
    if (error) throw error
    
    return res.status(200).json({
      posts: data,
      count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return res.status(500).json({ error: 'Lỗi khi lấy bài đăng' })
  }
}

// Xử lý POST request - Tạo bài đăng mới
async function handlePost(req, res, user) {
  const { content } = req.body
  
  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'Nội dung bài đăng không được để trống' })
  }
  
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        { 
          content, 
          user_id: user.id,
          created_at: new Date()
        }
      ])
      .select(`
        *,
        profiles:user_id (username, avatar_url)
      `)
    
    if (error) throw error
    
    return res.status(201).json(data[0])
  } catch (error) {
    console.error('Error creating post:', error)
    return res.status(500).json({ error: 'Lỗi khi tạo bài đăng' })
  }
}