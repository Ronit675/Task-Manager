import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../context/useAuth'
import { apiRequest } from '../lib/api'

const projectStatusOptions = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED']
const taskStatusOptions = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

const formatDate = (value) => {
  if (!value) {
    return 'No due date'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

const Dashboard = () => {
  const { token, user, logout } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [projectDetail, setProjectDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    dueDate: '',
  })
  const [memberForm, setMemberForm] = useState({
    email: '',
    role: 'MEMBER',
  })
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM',
    assignee: '',
  })

  const loadDashboard = useCallback(async () => {
    const [dashboardResponse, projectsResponse] = await Promise.all([
      apiRequest('/dashboard', { token }),
      apiRequest('/projects', { token }),
    ])

    setDashboard(dashboardResponse)
    setProjects(projectsResponse.projects)

    setSelectedProjectId((currentProjectId) => {
      if (currentProjectId && projectsResponse.projects.some((project) => project._id === currentProjectId)) {
        return currentProjectId
      }

      return projectsResponse.projects[0]?._id || ''
    })
  }, [token])

  const loadProjectDetail = useCallback(async (projectId) => {
    if (!projectId) {
      setProjectDetail(null)
      return
    }

    const response = await apiRequest(`/projects/${projectId}`, { token })
    setProjectDetail(response)
  }, [token])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      try {
        setLoading(true)
        setPageError('')
        await loadDashboard()
      } catch (error) {
        if (!cancelled) {
          setPageError(error.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [loadDashboard])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!selectedProjectId) {
        setProjectDetail(null)
        return
      }

      try {
        await loadProjectDetail(selectedProjectId)
      } catch (error) {
        if (!cancelled) {
          setPageError(error.message)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [loadProjectDetail, selectedProjectId])

  const selectedProject = projectDetail?.project || null
  const selectedTasks = projectDetail?.tasks || []
  const currentMembership = selectedProject?.members?.find(
    (member) => member.user._id?.toString() === user?._id?.toString(),
  )
  const isWorkspaceAdmin = user?.role === 'admin'
  const isProjectAdmin = currentMembership?.role === 'ADMIN'
  const canManageProject = isWorkspaceAdmin || isProjectAdmin

  const handleCreateProject = async (event) => {
    event.preventDefault()

    try {
      setPageError('')
      const response = await apiRequest('/projects', {
        method: 'POST',
        token,
        body: projectForm,
      })

      setProjectForm({ name: '', description: '', dueDate: '' })
      await loadDashboard()
      setSelectedProjectId(response.project._id)
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handleProjectStatusChange = async (event) => {
    const nextStatus = event.target.value

    try {
      setPageError('')
      await apiRequest(`/projects/${selectedProjectId}`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      })
      await loadDashboard()
      await loadProjectDetail(selectedProjectId)
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handleAddMember = async (event) => {
    event.preventDefault()

    const normalizedEmail = memberForm.email.trim().toLowerCase()

    if (
      normalizedEmail === user?.email?.toLowerCase() &&
      memberForm.role === 'MEMBER'
    ) {
      setPageError('You cannot change your own role to member')
      return
    }

    if (
      normalizedEmail === selectedProject?.owner?.email?.toLowerCase() &&
      memberForm.role === 'MEMBER'
    ) {
      setPageError('Project owner cannot be changed to member')
      return
    }

    try {
      setPageError('')
      await apiRequest(`/projects/${selectedProjectId}/members`, {
        method: 'POST',
        token,
        body: memberForm,
      })
      setMemberForm({ email: '', role: 'MEMBER' })
      await loadProjectDetail(selectedProjectId)
      await loadDashboard()
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()

    try {
      setPageError('')
      await apiRequest(`/projects/${selectedProjectId}/tasks`, {
        method: 'POST',
        token,
        body: taskForm,
      })
      setTaskForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'MEDIUM',
        assignee: '',
      })
      await loadProjectDetail(selectedProjectId)
      await loadDashboard()
    } catch (error) {
      setPageError(error.message)
    }
  }

  const handleTaskStatusChange = async (taskId, status) => {
    try {
      setPageError('')
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        token,
        body: { status },
      })
      await loadProjectDetail(selectedProjectId)
      await loadDashboard()
    } catch (error) {
      setPageError(error.message)
    }
  }

  if (loading) {
    return <div className="page-shell loading-state">Loading workspace...</div>
  }

  return (
    <div className="page-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Team Task Manager</p>
          <h1>{user?.name}&apos;s workspace</h1>
          <p className="subtle-copy">
            Projects, assignees, and overdue work in one place.
          </p>
        </div>
        <div className="header-actions">
          <span className="user-chip">{user?.email}</span>
          <button className="ghost-button" onClick={logout} type="button">
            Logout
          </button>
        </div>
      </header>

      {pageError ? <div className="alert error-alert">{pageError}</div> : null}

      <section className="metric-grid">
        <article className="metric-panel">
          <span>Total projects</span>
          <strong>{dashboard?.summary.totalProjects || 0}</strong>
        </article>
        <article className="metric-panel">
          <span>Total tasks</span>
          <strong>{dashboard?.summary.totalTasks || 0}</strong>
        </article>
        <article className="metric-panel">
          <span>Assigned to me</span>
          <strong>{dashboard?.summary.assignedToMe || 0}</strong>
        </article>
        <article className="metric-panel danger-panel">
          <span>Overdue</span>
          <strong>{dashboard?.summary.overdueTasks || 0}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-column">
          {user?.role === 'admin' ? (
            <section className="surface">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Create project</p>
                  <h2>New team space</h2>
                </div>
              </div>
              <form className="stack-form" onSubmit={handleCreateProject}>
                <input
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Project name"
                  value={projectForm.name}
                />
                <textarea
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="What is this project for?"
                  rows="4"
                  value={projectForm.description}
                />
                <input
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  type="date"
                  value={projectForm.dueDate}
                />
                <button className="primary-button" type="submit">
                  Create project
                </button>
              </form>
            </section>
          ) : (
            <section className="surface">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Create project</p>
                  <h2>New team space</h2>
                </div>
              </div>
              <div className="restricted-panel">
                <p className="subtle-copy">Only workspace admins can create projects. Contact an admin to request a new project.</p>
              </div>
            </section>
          )}

          <section className="surface">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Projects</p>
                <h2>Accessible teams</h2>
              </div>
            </div>
            <div className="project-list">
              {projects.length === 0 ? (
                <p className="empty-state">Create your first project to start assigning work.</p>
              ) : (
                projects.map((project) => (
                  <button
                    className={`project-row ${project._id === selectedProjectId ? 'selected' : ''}`}
                    key={project._id}
                    onClick={() => setSelectedProjectId(project._id)}
                    type="button"
                  >
                    <div>
                      <strong>{project.name}</strong>
                      <span>{project.status.replace('_', ' ')}</span>
                    </div>
                    <small>{project.members.length} members</small>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="dashboard-column wide-column">
          <section className="surface">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Current project</p>
                <h2>{selectedProject?.name || 'Select a project'}</h2>
              </div>
              {selectedProject && canManageProject ? (
                <select
                  className="status-select"
                  onChange={handleProjectStatusChange}
                  value={selectedProject.status}
                >
                  {projectStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            {selectedProject ? (
              <div className="project-overview">
                <p>{selectedProject.description || 'No project description yet.'}</p>
                <div className="inline-details">
                  <span>Due {formatDate(selectedProject.dueDate)}</span>
                  <span>Role {currentMembership?.role || 'MEMBER'}</span>
                  <span>Owner {selectedProject.owner.name}</span>
                </div>
              </div>
            ) : (
              <p className="empty-state">Pick a project from the left to manage tasks and members.</p>
            )}
          </section>

          <div className="detail-grid">
            <section className="surface">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Members</p>
                  <h2>Team roster</h2>
                </div>
              </div>
              <div className="member-list">
                {selectedProject?.members?.map((member) => (
                  <div className="member-row" key={member.user._id}>
                    <div>
                      <strong>{member.user.name}</strong>
                      <span>{member.user.email}</span>
                    </div>
                    <small>{member.role}</small>
                  </div>
                ))}
              </div>

              {selectedProject && canManageProject ? (
                <form className="stack-form" onSubmit={handleAddMember}>
                  <input
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Member email"
                    type="email"
                    value={memberForm.email}
                  />
                  <select
                    onChange={(event) =>
                      setMemberForm((current) => ({ ...current, role: event.target.value }))
                    }
                    value={memberForm.role}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button className="secondary-button" type="submit">
                    Add or update member
                  </button>
                </form>
              ) : null}
            </section>

            <section className="surface">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Recent activity</p>
                  <h2>Status mix</h2>
                </div>
              </div>
              <div className="bucket-list">
                {taskStatusOptions.map((status) => (
                  <div className="bucket-row" key={status}>
                    <span>{status.replace('_', ' ')}</span>
                    <strong>{dashboard?.statusBuckets?.[status] || 0}</strong>
                  </div>
                ))}
              </div>
              <div className="recent-list">
                {dashboard?.recentTasks?.map((task) => (
                  <div className="recent-row" key={task._id}>
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.project?.name}</span>
                    </div>
                    <small>{task.status.replace('_', ' ')}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="surface">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Tasks</p>
                <h2>Delivery board</h2>
              </div>
            </div>

            {selectedProject && canManageProject ? (
              <form className="task-form-grid" onSubmit={handleCreateTask}>
                <input
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Task title"
                  value={taskForm.title}
                />
                <select
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, assignee: event.target.value }))
                  }
                  value={taskForm.assignee}
                >
                  <option value="">Unassigned</option>
                  {selectedProject.members.map((member) => (
                    <option key={member.user._id} value={member.user._id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, priority: event.target.value }))
                  }
                  value={taskForm.priority}
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                <input
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                  type="date"
                  value={taskForm.dueDate}
                />
                <textarea
                  className="task-description"
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, description: event.target.value }))
                  }
                  placeholder="Task details"
                  rows="3"
                  value={taskForm.description}
                />
                <button className="primary-button" type="submit">
                  Create task
                </button>
              </form>
            ) : null}

            <div className="task-list">
              {selectedTasks.length === 0 ? (
                <p className="empty-state">No tasks yet for this project.</p>
              ) : (
                selectedTasks.map((task) => {
                  const canUpdateTask =
                    canManageProject || task.assignee?._id === user?._id

                  return (
                    <article className="task-card" key={task._id}>
                      <div className="task-card-header">
                        <div>
                          <strong>{task.title}</strong>
                          <p>{task.description || 'No task description provided.'}</p>
                        </div>
                        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="inline-details">
                        <span>Due {formatDate(task.dueDate)}</span>
                        <span>Assignee {task.assignee?.name || 'Unassigned'}</span>
                        <span>Created by {task.createdBy?.name || 'Unknown'}</span>
                      </div>
                      <div className="task-actions">
                        <select
                          disabled={!canUpdateTask}
                          onChange={(event) =>
                            handleTaskStatusChange(task._id, event.target.value)
                          }
                          value={task.status}
                        >
                          {taskStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
