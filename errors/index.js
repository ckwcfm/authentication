const AuthError = (message = 'Unauthorized') => {
  const error = new Error(message)
  error.code = 401
  return error
}

const InternalServerError = (message = 'Internal Server Error') => {
  const error = new Error(message)
  error.code = 500
  return error
}

module.exports = {
  AuthError,
  InternalServerError,
}
