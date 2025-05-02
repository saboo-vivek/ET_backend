const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const passwordSchema = new Schema({
  uuid: {
    type: String,  // change data type to String
    required: true,
  },

  isActive: {
    type: Boolean,
    required: true
  },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: {
    type: String,  
    required: true,
  },
})

module.exports = mongoose.model('password', passwordSchema);

