import express from 'express'

import { getMe, login, signup } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.post('/signup', asyncHandler(signup))
router.post('/login', asyncHandler(login))
router.get('/me', authMiddleware, asyncHandler(getMe))

export default router
