const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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

Schema.plugin(mongoosePaginate)
module.exports = mongoose.model('User', Schema)
