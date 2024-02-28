const _ = require('lodash')

/* eslint-disable-next-line no-unused-vars --
 * blogs is not used, but should be kept to maintain the appropriate function signature
 **/
const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((sum, { likes }) => sum + likes, 0)

const favoriteBlog = (blogs) =>
  blogs.length === 0
    ? null
    : blogs.reduce((favSoFar, curBlog) => {
      if (curBlog.likes > favSoFar.likes) {
        return curBlog
      } else {
        return favSoFar
      }
    })

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const authors = _.toPairs(_.countBy(blogs, 'author')) // [[<author name>, <number of blogs>], ...]
  const sortedAuthors = _.sortBy(authors, [(author) => author[1]])
  const mostBlogsAuthor = sortedAuthors[sortedAuthors.length - 1]
  return { author: mostBlogsAuthor[0], blogs: mostBlogsAuthor[1] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  const authors = _.toPairs(_.groupBy(blogs, 'author')) // [[<author name>, <blogs[]>], ...]
  const authorsLikes = authors.map(([authorName, authorBlogs]) => [authorName, totalLikes(authorBlogs)])
  const sortedAuthorsLikes = _.sortBy(authorsLikes, [(author) => author[1]])
  const mostLikesAuthor = sortedAuthorsLikes[sortedAuthorsLikes.length - 1]
  return { author: mostLikesAuthor[0], likes: mostLikesAuthor[1] }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
