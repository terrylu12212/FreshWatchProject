import express from 'express'
import { signupUser, loginUser, getMe } from '../controllers/userController.js'
import requireAuth from '../middleware/requireAuth.js'
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({           
  windowMs: 15 * 60 * 1000,              
  max: 20,                                
  standardHeaders: true,                  
  legacyHeaders: false                    
})

const router = express.Router()

router.post('/login', authLimiter, loginUser)
router.post('/signup', authLimiter, signupUser)

// whoami endpoint (protected)
router.get('/me', requireAuth, getMe)

export default router