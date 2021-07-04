const { Schema, model } = require( 'mongoose' );

const CreditCardSchema = Schema({

  date: {
    type: String,
    require: true
  },
  month: {
    type: String,
    require: true
  },
  amount: {
    type: Number,
    require: true
  },
  amount_cuots: {
    type: Number,
    require: true
  },
  description: {
    type: String,
    require: true
  },
  registry: {
    type: String,
    required: true
  },
  cuots: {
    type: Number,
    require: true
  },
  installments_of: {
    type: Number,
    require: true
  },
  idUser: {
    type: Schema.Types.ObjectId
  }

});

module.exports = model( 'CreditCard', CreditCardSchema );