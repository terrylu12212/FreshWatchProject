import express from 'express'
import { runPrompt } from '../controllers/openAIController.js'

const router = express.Router()

router.get('/', runPrompt)

export default router