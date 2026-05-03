import bcrypt from 'bcryptjs'

import { USER_ROLES } from '../constants/domain.js'
import User from '../models/User.js'
import createToken from '../utils/createToken.js'
import sanitizeUser from '../utils/sanitizeUser.js'

const signup = async (request, response) => {
  const name = request.body.name?.trim()
  const email = request.body.email?.trim().toLowerCase()
  const password = request.body.password
  const role = request.body.role?.trim().toLowerCase()

  if (!name || name.length < 2) {
    response.status(400)
    throw new Error('Name must be at least 2 characters')
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    response.status(400)
    throw new Error('Enter a valid email address')
  }

  if (!password || password.length < 6) {
    response.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  if (role && !USER_ROLES.includes(role)) {
    response.status(400)
    throw new Error('Role must be either "admin" or "member"')
  }

  const existingUser = await User.findOne({ email })

  if (existingUser) {
    response.status(409)
    throw new Error('An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(password, 10)

  let user
  try {
    user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'member',
    })
  } catch (error) {
    if (error?.code === 11000) {
      response.status(409)
      throw new Error('An account with this email already exists', { cause: error })
    }

    throw error
  }

  response.status(201).json({
    token: createToken(user._id),
    user: sanitizeUser(user),
  })
}

const login = async (request, response) => {
  const email = request.body.email?.trim().toLowerCase()
  const password = request.body.password

  if (!email || !password) {
    response.status(400)
    throw new Error('Email and password are required')
  }

  const user = await User.findOne({ email })

  if (!user) {
    response.status(401)
    throw new Error('Invalid email or password')
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatches) {
    response.status(401)
    throw new Error('Invalid email or password')
  }

  response.json({
    token: createToken(user._id),
    user: sanitizeUser(user),
  })
}

const getMe = (request, response) => {
  response.json({
    user: request.user,
  })
}

export { getMe, login, signup }
