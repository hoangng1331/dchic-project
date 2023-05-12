const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const employeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    required: true,
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
  deliveryArea: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        if (["Hòa Vang", "Hải Châu", "Thanh Khê", "Liên Chiểu", "Ngũ Hành Sơn", "Cẩm Lệ", "Sơn Trà"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Status: {VALUE} is invalid!`,
    },
  },
  address: { type: String, required: true },
  birthday: { type: Date },
  role: {
    type: String,
    required: true,
    validate: {
      validator: (value) => {
        if (["Quản lý", "Chăm sóc khách hàng", "Giao hàng"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Role: {VALUE} is invalid!`,
    },
  },
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
  password: {type:String, required: true}
});

// Virtuals
employeeSchema.virtual('fullName').get(function () {
  return this.lastName + " " + this.firstName;
});

// Virtuals in console.log()
employeeSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
employeeSchema.set('toJSON', { virtuals: true });

const Employee = model("Employee", employeeSchema);
// const Employee = mongoose.model("Employee", employeeSchema);
// RESET pId
// Employee.resetCount(function(err, nextCount) {
//   console.log('Auto-increment has been reset!'); 
// });
module.exports = Employee;
