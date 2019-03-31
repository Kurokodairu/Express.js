var mongoose = require('mongoose');

var msgSchema = new mongoose.Schema({
    sender: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true
    }
  });


var Msg = mongoose.model('Msg', msgSchema);
module.exports = Msg;
