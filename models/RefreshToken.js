const mongoose = require('mongoose')

const Schema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
      n: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      versionKey: false,
      virtuals: true,
      transform(doc, ret) {
        delete ret._id
      },
    },
  }
)

module.exports = mongoose.model('RefreshToken', Schema)
