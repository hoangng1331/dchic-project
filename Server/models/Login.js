const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);
const loginSchema = new Schema(
   {employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: false },
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
    password: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: "Offline",
      validate: {
        validator: (value) => {
          if (["Online", "Offline"].includes(value)) {
            return true;
          }
          return false;
        },
        message: `Status type: {VALUE} is invalid!`,
      },
    },
    active: {
      type: Boolean,
      default: true,
    }
  },
  {
    versionKey: false,
  },
);
loginSchema.virtual("name", {
  ref: "Employee",
  localField: "employeeId",
  foreignField: "_id",
  justOne: true,
});
loginSchema.set('toObject', { virtuals: true });
// Virtuals in JSON
loginSchema.set('toJSON', { virtuals: true });
const Login = model('Login', loginSchema);  
 
module.exports = Login;