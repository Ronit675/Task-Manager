const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role || 'member',
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export default sanitizeUser
