const crypto = require('crypto')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)
const generateKeyPair = util.promisify(crypto.generateKeyPair)
const { KEY_PAIR_SET } = require('../constants')

const createKeyPairSet = async ({ keyPairSetName }) => {
  try {
    const keyPairFunctions = Array(5)
      .fill()
      .map(() => {
        return createKeyPair()
      })
    const keyPairSet = await Promise.all(keyPairFunctions)
    await writeFile(
      `./files/${keyPairSetName}.json`,
      JSON.stringify(keyPairSet),
      {
        flag: 'w',
      }
    )
  } catch (error) {
    throw error
  }
}

const createKeyPair = async () => {
  try {
    const RSA = 'rsa'
    const options = {
      modulusLength: 1024 * 2,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        // cipher: 'aes-256-cbc',
        // passphrase: passphrase,
      },
    }
    const kid = crypto.randomUUID()
    const { publicKey, privateKey } = await generateKeyPair(RSA, options)
    return { kid, publicKey, privateKey }
  } catch (error) {
    throw error
  }
}

const start = async () => {
  await createKeyPairSet({ keyPairSetName: KEY_PAIR_SET.accessToken })
}
// start()
