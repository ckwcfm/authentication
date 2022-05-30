const router = require('express').Router()
const pem2jwk = require('pem-jwk').pem2jwk
const { KEY_PAIR_SET } = require('../../constants')

router.use('/auth', require('./auth'))
router.use('/users', require('./user'))

router.get('/', async (req, res, next) => {
  try {
    res.send('v1 get router')
  } catch (error) {
    next(error)
  }
})

router.get('/.well-known/jwks.json', async (req, res, next) => {
  try {
    console.log('wellknon', new Date())
    const keyPairSet = require(`../../files/${KEY_PAIR_SET.accessToken}.json`)
    // console.log({ keyPairSet })
    // let jwk = pem2jwk(publicKey, { alg: 'RS256', kid: kid, use: 'sig' })

    const jwks = keyPairSet.map((keyPair) => {
      return pem2jwk(keyPair.publicKey, {
        alg: 'RS256',
        kid: keyPair.kid,
        use: 'sig',
      })
    })
    res.status(200).json({ keys: jwks })
  } catch (error) {
    next(error)
  }
})

module.exports = router
