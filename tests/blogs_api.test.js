const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const mongoose = require('mongoose')

const api = supertest(app)

describe('when there are initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('all blogs are returned in JSON format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('blogs have id property', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    const hasId = blogs.every((blog) => Object.hasOwn(blog, 'id'))
    assert(hasId)
  })

  describe('adding a blog', () => {
    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'The Greatest Blog',
        author: 'JI',
        url: 'www.greatblog.com',
        likes: 3,
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsFromDb = await helper.getBlogsFromDb()
      assert.strictEqual(blogsFromDb.length, helper.initialBlogs.length + 1)
      const foundBlog = blogsFromDb.find((blog) => {
        return (
          blog.title === newBlog.title &&
          blog.author === newBlog.author &&
          blog.url === newBlog.url &&
          blog.likes === newBlog.likes
        )
      })
      assert(foundBlog)
    })

    test('likes default to 0', async () => {
      const newBlog = {
        title: 'The Greatest Blog',
        author: 'JI',
        url: 'www.greatblog.com',
      }
      await api.post('/api/blogs').send(newBlog)

      const blogsFromDb = await helper.getBlogsFromDb()
      const foundBlog = blogsFromDb.find((blog) => {
        return blog.title === newBlog.title && blog.author === newBlog.author && blog.url === newBlog.url
      })
      assert.strictEqual(foundBlog.likes, 0)
    })

    test('requires title and url', async () => {
      const missingTitle = {
        author: 'JI',
        url: 'www.greatblog.com',
      }
      const missingUrl = {
        title: 'The Greatest Blog',
        author: 'JI',
      }
      const missingBoth = {
        author: 'JI',
      }
      await api.post('/api/blogs').send(missingTitle).expect(400)
      await api.post('/api/blogs').send(missingUrl).expect(400)
      await api.post('/api/blogs').send(missingBoth).expect(400)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deleting a single blog', () => {
    test('succeeds on existing blog', async () => {
      const blogToDelete = (await helper.getBlogsFromDb())[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const foundBlog = blogsAtEnd.find((blog) => {
        return (
          blog.title === blogToDelete.title &&
          blog.author === blogToDelete.author &&
          blog.url === blogToDelete.url &&
          blog.likes === blogToDelete.likes
        )
      })
      assert(!foundBlog)
    })
  })

  describe('updating a single blog', () => {
    let blogsAtStart
    let blogToUpdate
    beforeEach(async () => {
      blogsAtStart = await helper.getBlogsFromDb()
      blogToUpdate = blogsAtStart[0]
    })

    test('succeeds with valid changes', async () => {
      const update = {
        title: 'Blog is Updated',
        author: 'The updater',
        url: 'www.newwebsite.org',
        likes: 5,
      }

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(update).expect(200)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)

      const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
      const updateMatches =
        update.title === updatedBlog.title &&
        update.author === updatedBlog.author &&
        update.url === updatedBlog.url &&
        update.likes === updatedBlog.likes
      assert(updateMatches)
    })

    test('succeed when only changing likes', async () => {
      const update = {
        likes: 2,
      }

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(update).expect(200)

      const blogsAtEnd = await helper.getBlogsFromDb()
      const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
      assert.strictEqual(updatedBlog.likes, update.likes)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
