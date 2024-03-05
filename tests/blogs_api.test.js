const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const mongoose = require('mongoose')

const api = supertest(app)

describe('working with users', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await User.insertMany(helper.initialUsers)
  })

  test('get all users as json', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, helper.initialUsers.length)
  })

  describe('addition of new users', () => {
    test('succeeds with valid user', async () => {
      const usersAtStart = await helper.getUsersFromDb()

      const newUser = {
        username: 'IWMor',
        name: 'Corey',
        password: 'jr*29gW',
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.getUsersFromDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
      const foundUser = usersAtEnd.find((user) => user.username === newUser.username)
      assert(foundUser)
    })

    test('require username and password with at least 3 characters', async () => {
      const usersAtStart = await helper.getUsersFromDb()

      const missingUsername = {
        name: 'Corey',
        password: 'jr*29gW',
      }
      const missingPassword = {
        username: 'IWMor',
        name: 'Corey',
      }
      const missingBoth = {
        name: 'Corey',
      }
      const shortUsername = {
        username: 'kf',
        name: 'Corey',
        password: 'jr*29gW',
      }
      const shortPassword = {
        username: 'IWMor',
        name: 'Corey',
        password: 'p',
      }
      const shortBoth = {
        name: 'Corey',
      }
      const usersToAdd = [missingUsername, missingPassword, missingBoth, shortUsername, shortPassword, shortBoth]

      for (const user of usersToAdd) {
        const response = await api.post('/api/users').send(user).expect(400)
        assert(response.body.error.includes('User validation failed'))
      }

      const usersAtEnd = await helper.getUsersFromDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
    })

    test('require unique username', async () => {
      const usersAtStart = await helper.getUsersFromDb()

      const newUser1 = {
        username: 'IWMor',
        name: 'Corey',
        password: 'jr*29gW',
      }

      const newUser2 = {
        username: 'IWMor',
        name: 'Ilso',
        password: 'Mfk31',
      }

      await api.post('/api/users').send(newUser1).expect(201)
      const response = await api.post('/api/users').send(newUser2).expect(400)

      const usersAtEnd = await helper.getUsersFromDb()
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

      // Make sure only one user match the username and that user is newUser1
      const foundUsers = usersAtEnd.filter((user) => user.username === newUser1.username)
      assert(foundUsers.length === 1 && foundUsers[0].name === newUser1.name)
      assert(response.body.error.includes('expected `username` to be unique'))
    })
  })
})

describe('working with blogs', async () => {
  const headers = {
    Authorization: null,
  }
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    const users = await User.insertMany(helper.initialUsers)
    for (const user of users) {
      // Add user id reference to the blogs
      const blogs = helper.initialBlogs[user.username].map((blog) => ({ ...blog, user: user._id }))
      const savedBlogs = await Blog.insertMany(blogs)
      // Add blog id references to user
      user.blogs = savedBlogs.map((blog) => blog._id)
      await user.save()
    }

    const response = await api.post('/api/login').send({ username: 'Bret', password: 'JKF35k!_3' })
    headers.Authorization = `Bearer ${response.body.token}`
  })

  test('all blogs are returned in JSON format', async () => {
    const blogsFromDb = await helper.getBlogsFromDb()

    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, blogsFromDb.length)
  })

  test('blogs have id property', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    const hasId = blogs.every((blog) => Object.hasOwn(blog, 'id'))
    assert(hasId)
  })

  describe('adding a blog', () => {
    test('a valid blog can be added', async () => {
      const blogsAtStart = await helper.getBlogsFromDb()

      const newBlog = {
        title: 'The Greatest Blog',
        author: 'JI',
        url: 'www.greatblog.com',
        likes: 3,
      }
      await api
        .post('/api/blogs')
        .set(headers)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)
      const foundBlog = blogsAtEnd.find((blog) => {
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
      await api.post('/api/blogs').set(headers).send(newBlog)

      const blogsFromDb = await helper.getBlogsFromDb()
      const foundBlog = blogsFromDb.find((blog) => {
        return blog.title === newBlog.title && blog.author === newBlog.author && blog.url === newBlog.url
      })
      assert.strictEqual(foundBlog.likes, 0)
    })

    test('requires title and url', async () => {
      const blogsAtStart = await helper.getBlogsFromDb()
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
      await api.post('/api/blogs').set(headers).send(missingTitle).expect(400)
      await api.post('/api/blogs').set(headers).send(missingUrl).expect(400)
      await api.post('/api/blogs').set(headers).send(missingBoth).expect(400)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
    })

    test('fails if missing token with proper status code', async () => {
      const blogsAtStart = await helper.getBlogsFromDb()

      const newBlog = {
        title: 'The Greatest Blog',
        author: 'JI',
        url: 'www.greatblog.com',
        likes: 3,
      }
      await api
        .post('/api/blogs') // Headers with token not set
        .send(newBlog)
        .expect(401)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
      const foundBlog = blogsAtEnd.find((blog) => {
        return (
          blog.title === newBlog.title &&
          blog.author === newBlog.author &&
          blog.url === newBlog.url &&
          blog.likes === newBlog.likes
        )
      })
      assert(!foundBlog)
    })
  })

  describe('deleting a single blog', () => {
    test('succeeds on existing blog', async () => {
      const blogsAtStart = await helper.getBlogsFromDb()

      const user = await User.findOne({ username: 'Bret' }) // User matching the credential from the setup
      const blogToDelete = await Blog.findById(user.blogs[0])
      // (await helper.getBlogsFromDb())[0]

      await api.delete(`/api/blogs/${blogToDelete.id}`).set(headers).expect(204)

      const blogsAtEnd = await helper.getBlogsFromDb()
      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

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
