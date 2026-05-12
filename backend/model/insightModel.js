const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

async function getPosts(visitorKey) {
  const { data, error } = await supabase
    .from('insights_posts')
    .select(`id, title, body, created_at, like_count, comments:insights_post_comments(id, author_name, body, created_at)`)
    .order('created_at', { ascending: false })

  if (error) throw error

  // fetch which posts this visitor has liked
  let likedPostIds = new Set()
  if (visitorKey) {
    const { data: likes } = await supabase
      .from('insights_post_likes')
      .select('post_id')
      .eq('visitor_key', visitorKey)

    if (likes) {
      likes.forEach((l) => likedPostIds.add(l.post_id))
    }
  }

  return (data || []).map((post) => ({
    ...post,
    comments: post.comments || [],
    liked: likedPostIds.has(post.id),
    like_count: typeof post.like_count === 'number' ? post.like_count : 0,
  }))
}

async function toggleLike(postId, visitorKey) {
  if (!visitorKey) throw new Error('visitorKey is required.')

  const { data: existing, error: fetchError } = await supabase
    .from('insights_post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('visitor_key', visitorKey)
    .maybeSingle()

  if (fetchError) throw fetchError

  let liked
  if (existing) {
    const { error } = await supabase.from('insights_post_likes').delete().eq('id', existing.id)
    if (error) throw error
    liked = false
  } else {
    const { error } = await supabase.from('insights_post_likes').insert({ post_id: postId, visitor_key: visitorKey })
    if (error) throw error
    liked = true
  }

  const { count, error: countError } = await supabase
    .from('insights_post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId)

  if (countError) throw countError

  return { liked, like_count: count || 0 }
}

async function addComment(postId, visitorKey, authorName, body) {
  if (!visitorKey) throw new Error('visitorKey is required.')
  if (!authorName || !body) throw new Error('authorName and body are required.')

  const { error } = await supabase
    .from('insights_post_comments')
    .insert({ post_id: postId, visitor_key: visitorKey, author_name: authorName, body })

  if (error) throw error

  const { data, error: fetchError } = await supabase
    .from('insights_post_comments')
    .select('id, author_name, body, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (fetchError) throw fetchError

  return data || []
}

async function createPost(title, body) {
  if (!title || !body) throw new Error('title and body are required.')

  const { data, error } = await supabase
    .from('insights_posts')
    .insert({ title, body })
    .select('id, title, body, created_at, like_count')
    .maybeSingle()

  if (error) throw error
  return data
}

async function updatePost(postId, title, body) {
  if (!postId) throw new Error('postId is required.')
  if (!title || !body) throw new Error('title and body are required.')

  const { data, error } = await supabase
    .from('insights_posts')
    .update({ title, body })
    .eq('id', postId)
    .select('id, title, body, created_at, like_count')
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Post not found.')
  return data
}

async function deletePost(postId) {
  if (!postId) throw new Error('postId is required.')

  const { error } = await supabase.from('insights_posts').delete().eq('id', postId)
  if (error) throw error
  return true
}

module.exports = { getPosts, toggleLike, addComment, createPost, updatePost, deletePost }