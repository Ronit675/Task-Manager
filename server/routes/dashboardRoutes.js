import express from 'express'

import { getDashboard } from '../controllers/dashboardController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', asyncHandler(getDashboard))

export default router
