import express from 'express'

import { updateTask } from '../controllers/taskController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.use(authMiddleware)

router.patch('/:taskId', asyncHandler(updateTask))

export default router
