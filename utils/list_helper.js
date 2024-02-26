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

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
