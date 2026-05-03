import express from 'express'

import {
  addOrUpdateMember,
  createProject,
  createTaskForProject,
  getProjectDetail,
  listProjects,
  listProjectTasks,
  updateProject,
} from '../controllers/projectController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', asyncHandler(listProjects))
router.post('/', asyncHandler(createProject))
router.get('/:projectId', asyncHandler(getProjectDetail))
router.patch('/:projectId', asyncHandler(updateProject))
router.post('/:projectId/members', asyncHandler(addOrUpdateMember))
router.get('/:projectId/tasks', asyncHandler(listProjectTasks))
router.post('/:projectId/tasks', asyncHandler(createTaskForProject))

export default router
