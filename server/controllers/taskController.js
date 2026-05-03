import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/domain.js'
import Task from '../models/Task.js'
import {
  ensureProjectAccess,
  getMembershipForProject,
  getMemberUserId,
} from '../utils/projectAccess.js'

const updateTask = async (request, response) => {
  const task = await Task.findById(request.params.taskId)

  if (!task) {
    response.status(404)
    throw new Error('Task not found')
  }

  const project = await ensureProjectAccess(task.project, request.user._id)
  const membership = getMembershipForProject(project, request.user._id)

  if (!membership) {
    response.status(403)
    throw new Error('You are not a project member')
  }

  const isAdmin = membership.role === 'ADMIN'
  const isAssignee = task.assignee?.toString() === request.user._id.toString()

  if (!isAdmin && !isAssignee) {
    response.status(403)
    throw new Error('Only admins or the assigned member can update this task')
  }

  const { title, description, dueDate, priority, assignee, status } = request.body

  if (!isAdmin && Object.keys(request.body).some((key) => key !== 'status')) {
    response.status(403)
    throw new Error('Members can only update task status')
  }

  if (title !== undefined) {
    const trimmedTitle = title.trim()
    if (trimmedTitle.length < 3) {
      response.status(400)
      throw new Error('Task title must be at least 3 characters')
    }
    task.title = trimmedTitle
  }

  if (description !== undefined) {
    task.description = description.trim()
  }

  if (priority !== undefined) {
    if (!TASK_PRIORITIES.includes(priority)) {
      response.status(400)
      throw new Error('Task priority is invalid')
    }
    task.priority = priority
  }

  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) {
      response.status(400)
      throw new Error('Task status is invalid')
    }
    task.status = status
  }

  if (dueDate !== undefined) {
    const parsedDate = dueDate ? new Date(dueDate) : null
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      response.status(400)
      throw new Error('Task due date is invalid')
    }
    task.dueDate = parsedDate
  }

  if (assignee !== undefined) {
    if (assignee) {
      const isMember = project.members.some(
        (member) => getMemberUserId(member) === assignee,
      )

      if (!isMember) {
        response.status(400)
        throw new Error('Assignee must already be a member of the project')
      }
    }

    task.assignee = assignee || null
  }

  await task.save()
  await task.populate('assignee', 'name email')
  await task.populate('createdBy', 'name email')

  response.json({ task })
}

export { updateTask }
