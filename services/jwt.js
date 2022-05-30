const util = require('util')
const jwt = require('jsonwebtoken')
const jwtSign = util.promisify(jwt.sign)
const jwtVerify = util.promisify(jwt.verify)
const moment = require('moment-timezone')
const { AuthError, InternalServerError } = require('../errors')
const { sample } = require('lodash')

const RefreshToken = require('../models/RefreshToken')
const { KEY_PAIR_SET, ENV } = require('../constants')
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET
const issuer = process.env.ISSUER

const accessTokenExp = () => {
  return process.env.ENV === ENV.production
    ? moment().add('1', 'hours').unix()
    : moment().add('1', 'days').unix()
}

const _createAccessToken = async ({ user }) => {
  try {
    const { id, username } = user

    const exp = accessTokenExp()
    const keyPairSet = require(`../files/${KEY_PAIR_SET.accessToken}.json`)
    const keyPair = sample(keyPairSet)
    const privateKey = keyPair.privateKey
    const token = await jwtSign({ id, username, exp }, privateKey, {
      algorithm: 'RS256',
      issuer,
      keyid: keyPair.kid,
    })
    return { token: `Bearer ${token}`, tokenExp: exp }
  } catch (error) {
    console.error(error)
  }
}

const _createRefreshToken = async ({ user }) => {
  try {
    const { id, username } = user
    const exp = moment().add('1', 'years').unix()
    const token = await jwtSign({ id, username, exp }, refreshTokenSecret, {
      algorithm: 'HS256',
      issuer,
    })
    return { refreshToken: `Bearer ${token}`, refreshTokenExp: exp }
  } catch (error) {
    console.error(error)
  }
}

const createAccessAndRefreshToken = async ({ user }) => {
  const { token, tokenExp } = await _createAccessToken({ user })
  const { refreshToken, refreshTokenExp } = await _createRefreshToken({
    user,
  })
  return {
    token,
    tokenExp,
    refreshToken,
    refreshTokenExp,
  }
}

const verifyAccessToken = async ({ token }) => {
  try {
    const { header } = jwt.decode(token, { complete: true })
    const kid = header?.kid
    const keyPairSet = require(`../files/${KEY_PAIR_SET.accessToken}.json`)
    const keyPair = keyPairSet.find((keyPair) => keyPair.kid === kid)
    const publicKey = keyPair?.publicKey
    if (!publicKey) {
      throw InternalServerError()
    }
    const decoded = await jwtVerify(token, publicKey, {
      algorithm: 'RS256',
      issuer,
    })
    return decoded
  } catch (error) {
    console.log({ error })
    throw AuthError()
  }
}

const verifyAndRemoveRefreshToken = async ({ authorization }) => {
  try {
    const token = authorization.replace('Bearer ', '')
    const user = await jwtVerify(token, refreshTokenSecret, {
      algorithm: 'HS256',
      issuer,
    })
    const { id } = user
    const refreshToken = await RefreshToken.findOne({
      userId: id,
      token: authorization,
    })

    if (!refreshToken) {
      // * refreshToken reuse, need to delete all users refreshTokens
      await RefreshToken.deleteMany({ userId: id })
      throw AuthError()
    }

    await refreshToken.delete()
    return user
  } catch (error) {
    console.log(`error ${error}`)
    throw error
  }
}

module.exports = {
  createAccessAndRefreshToken,
  verifyAccessToken,
  verifyAndRemoveRefreshToken,
}
