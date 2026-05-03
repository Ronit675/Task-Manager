import express from 'express'

import authMiddleware from '../middleware/authMiddleware.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import asyncHandler from '../utils/asyncHandler.js'

const router = express.Router()

router.use(authMiddleware)

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const projectDocs = await Project.find({
      'members.user': request.user._id,
    }).select('_id name')

    const projectIds = projectDocs.map((project) => project._id)
    const now = new Date()

    const [tasks, overdueCount, totalTasks, assignedToMe, groupedStatuses] = await Promise.all([
      Task.find({
        project: { $in: projectIds },
      })
        .sort({ dueDate: 1, createdAt: -1 })
        .limit(8)
        .populate('project', 'name')
        .populate('assignee', 'name email'),
      Task.countDocuments({
        project: { $in: projectIds },
        dueDate: { $lt: now },
        status: { $ne: 'DONE' },
      }),
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({
        project: { $in: projectIds },
        assignee: request.user._id,
        status: { $ne: 'DONE' },
      }),
      Task.aggregate([
        {
          $match: {
            project: { $in: projectIds },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    const statusBuckets = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0,
    }

    groupedStatuses.forEach((entry) => {
      statusBuckets[entry._id] = entry.count
    })

    response.json({
      summary: {
        totalProjects: projectDocs.length,
        totalTasks,
        overdueTasks: overdueCount,
        assignedToMe,
      },
      statusBuckets,
      recentTasks: tasks,
    })
  }),
)

export default router
