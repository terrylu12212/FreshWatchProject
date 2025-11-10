import express from 'express'
import { getICalendar } from '../controllers/iCalendarController.js'
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router()

router.use(requireAuth)
router.get('/', getICalendar)

export default router