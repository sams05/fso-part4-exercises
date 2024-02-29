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

  describe('adding a note', () => {
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
  /*
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
    })*/
  })
})

after(async () => {
  await mongoose.connection.close()
})
