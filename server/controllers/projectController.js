import {
  PROJECT_MEMBER_ROLES,
  PROJECT_STATUSES,
  TASK_PRIORITIES,
} from '../constants/domain.js'
import Project from '../models/Project.js'
import Task from '../models/Task.js'
import User from '../models/User.js'
import {
  ensureAdminAccess,
  ensureProjectAccess,
  getMemberUserId,
  memberSummary,
} from '../utils/projectAccess.js'

const listProjects = async (request, response) => {
  const projects = await Project.find({
    'members.user': request.user._id,
  })
    .sort({ updatedAt: -1 })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')

  response.json({ projects })
}

const createProject = async (request, response) => {
  if ((request.user?.role || '').toLowerCase() !== 'admin') {
    response.status(403)
    throw new Error('Only admins may create projects')
  }

  const name = request.body.name?.trim()
  const description = request.body.description?.trim() || ''
  const dueDate = request.body.dueDate ? new Date(request.body.dueDate) : null

  if (!name || name.length < 3) {
    response.status(400)
    throw new Error('Project name must be at least 3 characters')
  }

  if (dueDate && Number.isNaN(dueDate.getTime())) {
    response.status(400)
    throw new Error('Project due date is invalid')
  }

  const project = await Project.create({
    name,
    description,
    dueDate,
    owner: request.user._id,
    members: [{ user: request.user._id, role: 'ADMIN' }],
  })

  const populatedProject = await Project.findById(project._id)
    .populate('owner', 'name email')
    .populate('members.user', 'name email')

  response.status(201).json({ project: populatedProject })
}

const getProjectDetail = async (request, response) => {
  const project = await ensureProjectAccess(request.params.projectId, request.user._id)
  const tasks = await Task.find({ project: project._id })
    .sort({ createdAt: -1 })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')

  response.json({ project, tasks })
}

const updateProject = async (request, response) => {
  const project = await ensureAdminAccess(request.params.projectId, request.user._id)
  const { name, description, status, dueDate } = request.body

  if (name !== undefined) {
    const trimmedName = name.trim()
    if (trimmedName.length < 3) {
      response.status(400)
      throw new Error('Project name must be at least 3 characters')
    }
    project.name = trimmedName
  }

  if (description !== undefined) {
    project.description = description.trim()
  }

  if (status !== undefined) {
    if (!PROJECT_STATUSES.includes(status)) {
      response.status(400)
      throw new Error('Project status is invalid')
    }
    project.status = status
  }

  if (dueDate !== undefined) {
    const parsedDate = dueDate ? new Date(dueDate) : null
    if (parsedDate && Number.isNaN(parsedDate.getTime())) {
      response.status(400)
      throw new Error('Project due date is invalid')
    }
    project.dueDate = parsedDate
  }

  await project.save()
  await project.populate('owner', 'name email')
  await project.populate('members.user', 'name email')

  response.json({ project })
}

const addOrUpdateMember = async (request, response) => {
  const project = await ensureAdminAccess(request.params.projectId, request.user._id)
  const email = request.body.email?.trim().toLowerCase()
  const role = request.body.role

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400)
    throw new Error('Enter a valid member email')
  }

  if (!PROJECT_MEMBER_ROLES.includes(role)) {
    response.status(400)
    throw new Error('Member role is invalid')
  }

  const user = await User.findOne({ email })

  if (!user) {
    response.status(404)
    throw new Error('No user found with that email')
  }

  if (email === request.user.email && role === 'MEMBER') {
    response.status(400)
    throw new Error('You cannot change your own role to member')
  }

  if (role === 'MEMBER' && project.owner?._id?.toString() === user._id.toString()) {
    response.status(400)
    throw new Error('Project owner cannot be changed to member')
  }

  const existingMember = project.members.find(
    (member) => getMemberUserId(member) === user._id.toString(),
  )

  if (existingMember) {
    existingMember.role = role
  } else {
    project.members.push({ user: user._id, role })
  }

  await project.save()
  await project.populate('members.user', 'name email')

  response.status(201).json({
    members: project.members.map(memberSummary),
  })
}

const listProjectTasks = async (request, response) => {
  const project = await ensureProjectAccess(request.params.projectId, request.user._id)

  const tasks = await Task.find({ project: project._id })
    .sort({ dueDate: 1, createdAt: -1 })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')

  response.json({ tasks })
}

const createTaskForProject = async (request, response) => {
  const isWorkspaceAdmin = (request.user?.role || '').toLowerCase() === 'admin'
  const project = isWorkspaceAdmin
    ? await ensureProjectAccess(request.params.projectId, request.user._id)
    : await ensureAdminAccess(request.params.projectId, request.user._id)
  const title = request.body.title?.trim()
  const description = request.body.description?.trim() || ''
  const dueDate = request.body.dueDate ? new Date(request.body.dueDate) : null
  const assignee = request.body.assignee || null
  const priority = request.body.priority || 'MEDIUM'

  if (!title || title.length < 3) {
    response.status(400)
    throw new Error('Task title must be at least 3 characters')
  }

  if (dueDate && Number.isNaN(dueDate.getTime())) {
    response.status(400)
    throw new Error('Task due date is invalid')
  }

  if (!TASK_PRIORITIES.includes(priority)) {
    response.status(400)
    throw new Error('Task priority is invalid')
  }

  if (assignee) {
    const isMember = project.members.some(
      (member) => getMemberUserId(member) === assignee,
    )

    if (!isMember) {
      response.status(400)
      throw new Error('Assignee must already be a member of the project')
    }
  }

  const task = await Task.create({
    project: project._id,
    title,
    description,
    dueDate,
    assignee,
    priority,
    createdBy: request.user._id,
  })

  await task.populate('assignee', 'name email')
  await task.populate('createdBy', 'name email')

  response.status(201).json({ task })
}

export {
  addOrUpdateMember,
  createProject,
  createTaskForProject,
  getProjectDetail,
  listProjects,
  listProjectTasks,
  updateProject,
}
