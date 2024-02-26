/* eslint-disable-next-line no-unused-vars --
 * blogs is not used, but should be kept to maintain the appropriate function signature
**/
const dummy = (blogs) => 1

const totalLikes = (blogs) => blogs.reduce((sum, { likes }) => sum + likes, 0)

module.exports = {
  dummy,
  totalLikes,
}
