const config = require('./utils/config')
const app = require('./app')

const PORT = config.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
