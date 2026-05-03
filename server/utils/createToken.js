import jwt from 'jsonwebtoken'

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

export default createToken
