const { getPosts, toggleLike, addComment, createPost, updatePost, deletePost } = require('../model/insightModel')

async function handleGetPosts(req, res) {
  try {
    const visitorKey = req.query.visitorKey || ''
    const data = await getPosts(visitorKey)
    res.set('Cache-Control', 'no-store')
    return res.json({ data })
  } catch (err) {
    console.error('GET /posts error:', err)
    return res.status(500).json({ error: err.message || 'Could not load posts.' })
  }
}

async function handleLikePost(req, res) {
  try {
    const { postId } = req.params
    const { visitorKey } = req.body || {}
    const result = await toggleLike(postId, visitorKey)
    return res.json(result)
  } catch (err) {
    console.error('POST /like error:', err)
    return res.status(500).json({ error: err.message || 'Could not update like.' })
  }
}

async function handleAddComment(req, res) {
  try {
    const { postId } = req.params
    const { visitorKey, authorName, body } = req.body || {}
    const comments = await addComment(postId, visitorKey, authorName, body)
    return res.json({ comments })
  } catch (err) {
    console.error('POST /comments error:', err)
    return res.status(500).json({ error: err.message || 'Could not post comment.' })
  }
}

async function handleCreatePost(req, res) {
  try {
    const { title, body } = req.body || {}
    const post = await createPost(title, body)
    return res.status(201).json({ post })
  } catch (err) {
    console.error('POST /posts error:', err)
    return res.status(500).json({ error: err.message || 'Could not create post.' })
  }
}

async function handleUpdatePost(req, res) {
  try {
    const { postId } = req.params
    const { title, body } = req.body || {}
    const post = await updatePost(postId, title, body)
    return res.json({ post })
  } catch (err) {
    console.error('PUT /posts error:', err)
    return res.status(500).json({ error: err.message || 'Could not update post.' })
  }
}

async function handleDeletePost(req, res) {
  try {
    const { postId } = req.params
    await deletePost(postId)
    return res.json({ success: true })
  } catch (err) {
    console.error('DELETE /posts error:', err)
    return res.status(500).json({ error: err.message || 'Could not delete post.' })
  }
}

module.exports = { handleGetPosts, handleLikePost, handleAddComment, handleCreatePost, handleUpdatePost, handleDeletePost }