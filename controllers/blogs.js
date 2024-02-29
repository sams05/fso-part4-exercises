const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { title, author, url, likes = 0 } = request.body
  if (!title || !url) {
    return response.status(400).json({ error: 'blogs must have title and url' })
  }
  const blog = new Blog({
    title,
    author,
    url,
    likes,
  })

  const result = await blog.save()
  response.status(201).json(result)
})

module.exports = blogsRouter
