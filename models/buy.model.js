const { Schema, model } = require( 'mongoose' );

const BuySchema = Schema({

  date: {
    type: String,
    require: true
  },
  month: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  description: {
    type: String
  },
  amount: {
    type: Number,
    require: true
  },
  payment: {
    type: String,
    require: true
  },
  img: {
    type: String
  },
  idUser: {
    type: Schema.Types.ObjectId,
    require: true
  }

});

module.exports = model( 'Buy', BuySchema );