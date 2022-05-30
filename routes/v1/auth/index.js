const bcrypt = require('bcrypt')
const router = require('express').Router()
const moment = require('moment-timezone')
const User = require('../../../models/User')
const RefreshToken = require('../../../models/RefreshToken')
const { body, validate } = require('../../../middlewares/expressValidator')
const { AuthError } = require('../../../errors')
const {
  createAccessAndRefreshToken,
  verifyAndRemoveRefreshToken,
} = require('../../../services/jwt')

router.post(
  '/register/password',
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)

      const user = new User({ username, password: hashPassword })
      await user.save()

      const tokens = await createAccessAndRefreshToken({ user })
      await RefreshToken.create({
        userId: user.id,
        token: tokens.refreshToken,
      })

      res.status(200).json({
        id: user.id,
        username: user.username,
        ...tokens,
      })
    } catch (error) {
      next(error)
    }
  }
)

router.post(
  '/login/password',
  [
    body('username').isString().notEmpty(),
    body('password').isString().notEmpty(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username }).select('+password')
      if (!user) {
        throw AuthError('no user')
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        throw AuthError('invalid password')
      }

      const tokens = await createAccessAndRefreshToken({ user })
      const { refreshTokenExp, refreshToken } = tokens
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiryDate: moment.unix(refreshTokenExp).toDate(),
      })

      res.status(200).json({
        id: user.id,
        username: user.username,
        ...tokens,
      })
    } catch (error) {
      next(error)
    }
  }
)

router.post('/refresh', async (req, res, next) => {
  try {
    const authorization = req.cookies.authorization || req.headers.authorization
    const user = await verifyAndRemoveRefreshToken({ authorization })
    const tokens = await createAccessAndRefreshToken({ user })
    const { refreshTokenExp, refreshToken } = tokens
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiryDate: moment.unix(refreshTokenExp).toDate(),
    })
    res.status(200).json({
      id: user.id,
      username: user.username,
      ...tokens,
    })
  } catch (error) {
    next(AuthError())
  }
})

module.exports = router
