const express = require('express')
const {
  handleGetPosts,
  handleLikePost,
  handleAddComment,
  handleCreatePost,
  handleUpdatePost,
  handleDeletePost,
} = require('../controller/insightController')

const publicRouter = express.Router()
const adminRouter = express.Router()

const adminPassword = process.env.ADMIN_PASSWORD || ''

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-password']
  if (!adminPassword || token !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
}

// Public routes
publicRouter.get('/posts', handleGetPosts)
publicRouter.post('/posts/:postId/like', handleLikePost)
publicRouter.post('/posts/:postId/comments', handleAddComment)

// Admin routes — all protected
adminRouter.use(requireAdmin)
adminRouter.get('/posts', handleGetPosts)
adminRouter.post('/posts', handleCreatePost)
adminRouter.put('/posts/:postId', handleUpdatePost)
adminRouter.delete('/posts/:postId', handleDeletePost)

module.exports = { publicRouter, adminRouter }