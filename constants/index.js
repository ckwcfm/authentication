'use strict'

const ENV = Object.freeze({
  production: 'production',
  development: 'development',
  local: 'local',
})

const KEY_PAIR_SET = Object.freeze({
  accessToken: 'accessTokenKeyPairSet',
  refreshToken: 'refreshTokenKeyPairSet',
})

module.exports = {
  ENV,
  KEY_PAIR_SET,
}
