const { AuthError } = require('../errors')
const { verifyAccessToken } = require('../services/jwt')

const authorized = async (req, res, next) => {
  try {
    const authorization = req.cookies.authorization || req.headers.authorization
    if (!authorization) {
      return next(AuthError())
    }
    const token = authorization.replace('Bearer ', '')
    const { id, username } = await verifyAccessToken({ token })
    res.locals.user = { username, id }
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  authorized,
}
