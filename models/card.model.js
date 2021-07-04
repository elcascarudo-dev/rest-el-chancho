const { Schema, model } = require( 'mongoose' );

const CardSchema = Schema({

  idUser: {
    type: Schema.Types.ObjectId,
    require: true
  },
  expires: {
    type: Date,
    require: true
  },
  number: {
    type: Number,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  bank: {
    type: String,
    require: true
  },
  active: {
    type: Boolean,
    default: true
  },
  debt: {
    type: Boolean,
    default: false
  }

});

module.exports = model( 'Card', CardSchema );