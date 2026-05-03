import Project from '../models/Project.js'

const getMemberUserId = (member) =>
  member.user?._id?.toString() || member.user?.toString()

const getMembershipForProject = (project, userId) =>
  project.members.find((member) => getMemberUserId(member) === userId.toString())

const memberSummary = (member) => ({
  user: member.user,
  role: member.role,
})

const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId)
    .populate('owner', 'name email')
    .populate('members.user', 'name email')

  if (!project) {
    const error = new Error('Project not found')
    error.statusCode = 404
    throw error
  }

  const membership = getMembershipForProject(project, userId)

  if (!membership) {
    const error = new Error('You do not have access to this project')
    error.statusCode = 403
    throw error
  }

  return project
}

const ensureAdminAccess = async (projectId, userId) => {
  const project = await ensureProjectAccess(projectId, userId)
  const membership = getMembershipForProject(project, userId)

  if (membership.role !== 'ADMIN') {
    const error = new Error('Admin access is required for this action')
    error.statusCode = 403
    throw error
  }

  return project
}

export {
  ensureAdminAccess,
  ensureProjectAccess,
  getMemberUserId,
  getMembershipForProject,
  memberSummary,
}
