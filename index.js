const express = require('express')
const cors = require('cors')
const { ENV } = require('./constants')

require('dotenv').config()
require('./configs/keyPair')
require('./configs/mongodb')

const app = express()

if (process.env.ENV === ENV.production) {
} else {
  app.use(cors())
}

app.use(require('helmet')())
app.use(require('cookie-parser')())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(require('./routes'))

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  if (err) {
    const error = { error: err.message }
    if (process.env.NODE_ENV !== 'production') {
      error.stack = err.stack
    }
    console.log(error)
    return res.status(err.code || statusCode).json(error)
  } else {
    return res.status(statusCode).send(new Error('unknown error'))
  }
})
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log(`start server at port ${PORT}`)
})
