const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user

  // Save blog
  const blog = new Blog({ ...request.body, user: user._id })
  const savedBlog = await blog.save()

  // Update user
  user.blogs = user.blogs.concat(blog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user

  // Verify the blog is created by the user
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)
  if (blog.user.toString() !== user.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  // Delete blog
  await blog.deleteOne()
  user.blogs = user.blogs.filter((curBlogId) => curBlogId.toString() !== blogId)
  await user.save()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter
