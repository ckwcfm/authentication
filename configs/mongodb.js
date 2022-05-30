const mongoose = require('mongoose')

const MONGO_DB = process.env.MONGO_DB
mongoose.connect(MONGO_DB, { useNewUrlParser: true }, function (err, db) {
  if (err) {
    console.log(
      'Unable to connect to the server. Please start the server. Error:',
      err
    )
  } else {
    console.log('Connected to Database successfully!')
    mongoose.connection.db.listCollections().toArray((error, collections) => {
      const collectionNames = collections.map((collection) => collection.name)
      module.exports.collectionNames = collectionNames
    })
  }
})
