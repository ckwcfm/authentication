const {
  param,
  validate,
  query,
} = require('../../../middlewares/expressValidator')
const { authorized } = require('../../../middlewares/authenticate')
const User = require('../../../models/User')

const router = require('express').Router()

router.get(
  '/search',
  [query('text').isString()],
  validate,
  authorized,
  async (req, res, next) => {
    try {
      const { text } = req.query
      const query = {
        username: text,
      }
      const users = await User.find(query).limit(10)
      res.status(200).json(users)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:id',
  param('id').isMongoId(),
  validate,
  authorized,
  async (req, res, next) => {
    try {
      const { id } = req.params
      const user = await User.findById(id)
      res.status(200).json({
        username: user.username,
      })
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
