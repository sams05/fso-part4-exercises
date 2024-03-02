const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

const BCRYPT_SALT_ROUNDS = 10

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  const newUser = new User({
    username,
    name,
    passwordHash: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
  })

  const savedUser = await newUser.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
