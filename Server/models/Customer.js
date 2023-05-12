const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);

const customerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: {
    type: String,
    required: true,
    default: "Female",
    validate: {
      validator: (value) => {
        if (["Female", "Male"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Payment type: {VALUE} is invalid!`,
    },
  }, 
  email: {
    type: String,
    validate: {
      validator: function (value) {
        const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
        return emailRegex.test(value);
      },
      message: `{VALUE} is not a valid email!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
    required: [true, 'email is required'],
  },
  phoneNumber: {
    required: true,
    type: String,
    validate: {
      validator: function (value) {
        const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
        return phoneRegex.test(value);
      },
      message: `{VALUE} is not a valid phone!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
  },
  birthday: { type: Date },
  username: {
    required: true,
    type: String,
    unique: true,
    validate: {
      validator: function (value) {
        const phoneRegex = /^[A-Za-z0-9_\.@]+$/;
        return phoneRegex.test(value);
      },
      message: `{VALUE} is not a valid phone!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
  },
  password: { type: String, required: true },
});

// Virtuals
customerSchema.virtual('fullName').get(function () {
  return this.firstName + ' ' + this.lastName;
});

// Virtuals in console.log()
customerSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
customerSchema.set('toJSON', { virtuals: true });

// customerSchema.plugin(autoIncrement.plugin, {
//   model: "Customer",
//   field: "_id",
//   startAt: 1,
//   incrementBy: 1, 
//   });

//   customerSchema.pre('save', function (next) {
//     let doc = this;
//     // Check if the document is new
//     if (doc.isNew) {
//       let b =(doc._id).toString().padStart(6, '0');
//       doc._id = b ;
//     }
//     next();
//   });

const Customer = model('Customer', customerSchema);
// RESET pId
// Customer.resetCount(function(err, nextCount) {
//   console.log('Auto-increment has been reset!'); 
// });
module.exports = Customer;
