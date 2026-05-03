import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import asyncHandler from '../utils/asyncHandler.js'

const authMiddleware = asyncHandler(async (request, response, next) => {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    response.status(401)
    throw new Error('Authentication required')
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.userId).select('-passwordHash')

    if (!user) {
      response.status(401)
      throw new Error('User account no longer exists')
    }

    request.user = user
    next()
  } catch {
    response.status(401)
    throw new Error('Invalid or expired token')
  }
})

export default authMiddleware
