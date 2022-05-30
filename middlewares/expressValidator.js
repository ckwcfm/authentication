const expressValidator = require('express-validator')
const validate = async (req, res, next) => {
  try {
    const result = expressValidator
      .validationResult(req)
      .formatWith(({ location, msg, param, value }) => {
        console.log({ value })
        return `${location}[${param}]: ${msg}`
      })

    if (!result.isEmpty()) {
      const errorMessage = result.array().join(', ')
      next(new Error(errorMessage))
    }

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  ...expressValidator,
  validate,
}
