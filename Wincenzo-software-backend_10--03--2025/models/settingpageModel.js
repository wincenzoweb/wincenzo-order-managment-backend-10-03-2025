// const mongoose = require("mongoose");

// const settingSchema = new mongoose.Schema({
//   SenderMail: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   SenderEmailPassword: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   RecieverMail: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   MaxPendingDelay: {
//     type: Number,
//     required: true,
//     unique: true,
//   },
// });

// module.exports = mongoose.model("Setting", settingSchema);


// models/index.js

const mongoose = require("mongoose");

// Setting model
const settingSchema = new mongoose.Schema({
  SenderMail: {
    type: String,
    required: true,

  },
  SenderEmailPassword: {
    type: String,
    required: true,

  },
  MaxPendingDelay: {
    type: Number,
    required: true,

  },
});

const Setting = mongoose.model("Setting", settingSchema);

// RecieverMail model
const receiverMailSchema = new mongoose.Schema({
  receiverMail: {
    type: String,
    required: true,
  },
});

const ReceiverMail = mongoose.model("ReceiverMail", receiverMailSchema);

module.exports = {
  Setting,
  ReceiverMail,
};

