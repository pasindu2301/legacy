const express = require('express')
const {
  handleHealth,
  addWaitlist,
  getAdminWaitlist,
  deleteWaitlistById,
  deleteWaitlistByEmail,
} = require('../controller/waitlistController')

const adminPassword = process.env.ADMIN_PASSWORD || ''
const router = express.Router()

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-password']
  if (!adminPassword || token !== adminPassword) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  return next()
}

router.get('/health', handleHealth)
router.post('/waitlist', addWaitlist)
router.get('/admin/waitlist', requireAdmin, getAdminWaitlist)
router.delete('/admin/waitlist/:id', requireAdmin, deleteWaitlistById)
router.delete('/admin/waitlist/by-email/:email', requireAdmin, deleteWaitlistByEmail)

module.exports = router
