const loginRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const authenticated = user === null ? false : await bcrypt.compare(password, user.passwordHash)

  if (!authenticated) {
    return response.status(401).json({ error: 'invalid username or password' })
  }

  const rawToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(rawToken, process.env.SECRET)

  response.json({ token, username: user.username, name: user.name })
})

module.exports = loginRouter