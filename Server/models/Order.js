const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Mongoose Datatypes:
// https://mongoosejs.com/docs/schematypes.html

// Validator
// https://mongoosejs.com/docs/validation.html#built-in-validators

const orderDetailSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  imageUrl: String,
  colorId: { type: Schema.Types.ObjectId, ref: "Color", required: true },
  sizeId: { type: Schema.Types.ObjectId, ref: "Size", required: true },
  quantity: { type: Number, require: true, min: 0 },
  price: { type: Number, required: true, min: 0, default: 0 },
  discount: { type: Number, default: 0 },
});

orderDetailSchema.virtual('totalPrice').get(function() {
  return this.quantity * this.price * (100 - this.discount) / 100;
});
// Virtual with Populate
orderDetailSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: false,
});
orderDetailSchema.virtual("color", {
  ref: "Color",
  localField: "colorId",
  foreignField: "_id",
  justOne: false,
});
orderDetailSchema.virtual("size", {
  ref: "Size",
  localField: "sizeId",
  foreignField: "_id",
  justOne: false,
});
// Virtuals in console.log()
orderDetailSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
orderDetailSchema.set("toJSON", { virtuals: true });
// ------------------------------------------------------------------------------------------------

const orderSchema = new Schema({
  createdDate: {
    type: Date,
    required: true,
    default: Date.now,
  },

  shippedDate: {
    type: Date,
    validate: {
      validator: function (value) {
        if (!value) return true;

        if (value < this.createdDate) {
          return false;
        }
        return true;
      },
      message: `Shipped date: {VALUE} is invalid!`,
    },
  },

  paymentType: {
    type: String,
    required: true,
    default: "Cash",
    validate: {
      validator: (value) => {
        if (["Cash", "Credit Card", "Bank Transfer"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Payment type: {VALUE} is invalid!`,
    },
  },
  paymentStatus: {
    type: String,
    required: true,
    default: "Chưa thanh toán",
    validate: {
      validator: (value) => {
        if (["Chưa thanh toán", "Đã thanh toán", "Hủy", "Hủy và đã hoàn tiền", "Hủy và chưa hoàn tiền"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Payment type: {VALUE} is invalid!`,
    },
  },
  importStatus: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        if (["Chờ nhập kho", "Đã nhập kho"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Payment type: {VALUE} is invalid!`,
    },
  },
  note: {type: String, required: false},
  status: {
    type: String,
    required: true,
    default: "Waiting",
    validate: {
      validator: (value) => {
        if (["Waiting", "Completed", "Canceled", "Confirmed", "Shipping"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Status: {VALUE} is invalid!`,
    },
  },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: false },
  employeeLoginId: { type: Schema.Types.ObjectId, ref: "Login", required: false },
  verifyId: { type: Schema.Types.ObjectId, ref: "Login", required: false },
  shipperId: { type: Schema.Types.ObjectId, ref: "Employee", required: false },
  receiveMoneyConfirmId: { type: Schema.Types.ObjectId, ref: "Login", required: false },
  deliveryArea: {
    type: String,
    required: false,
    validate: {
      validator: (value) => {
        if (["Hòa Vang", "Hải Châu", "Thanh Khê", "Liên Chiểu", "Ngũ Hành Sơn", "Cẩm Lệ", "Sơn Trà", "Ngoại thành"].includes(value)) {
          return true;
        }
        return false;
      },
      message: `Delivery Area: {VALUE} is invalid!`,
    },
  },
  receiverName: { type: String, require: false },
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
    required: [false, "email is required"],
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function (value) {
        const phoneRegex =
          /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;
        return phoneRegex.test(value);
      },
      message: `{VALUE} is not a valid phone!`,
      // message: (props) => `{props.value} is not a valid email!`,
    },
  },
  address: { type: String, required: true },
   orderDetails: [orderDetailSchema],
  shippingFee: { type: Number, default: 0 },
});

// Virtual with Populate
orderSchema.virtual("customer", {
  ref: "Customer",
  localField: "customerId",
  foreignField: "_id",
  justOne: true,
});
orderSchema.virtual("shipper", {
  ref: "Employee",
  localField: "shipperId",
  foreignField: "_id",
  justOne: true,
});
orderSchema.virtual("receiveMoneyConfirmer", {
  ref: "Login",
  localField: "receiveMoneyConfirmId",
  foreignField: "_id",
  justOne: true,
});
orderSchema.virtual("verifier", {
  ref: "Login",
  localField: "verifyId",
  foreignField: "_id",
  justOne: true,
});
orderSchema.virtual("employeeLogin", {
  ref: "Login",
  localField: "employeeLoginId",
  foreignField: "_id",
  justOne: true,
});
orderSchema.virtual('totalProductValue').get(function() {
  const productMap = {};
  let total = 0;

  // Tính tổng sản phẩm cho mỗi productId
  this.orderDetails.forEach(orderItem => {
    const productId = orderItem.productId.toString();
    if (!productMap[productId]) {
      productMap[productId] = 0;
    }
    productMap[productId] += orderItem.quantity;
  });

  // Tính tổng giá trị cho từng sản phẩm
  Object.keys(productMap).forEach(productId => {
    const quantity = productMap[productId];
    const productTotal = this.orderDetails.reduce((total, orderItem) => {
      if (orderItem.productId.toString() === productId) {
        return total + orderItem.totalPrice;
      }
      return total;
    }, 0);
    total += productTotal;
  });

  return total;
});
orderSchema.virtual('totalQuantity').get(function() {
  let totalQuantity = 0;
  this.orderDetails.forEach(function(item) {
    totalQuantity += item.quantity;
  });
  return totalQuantity;
});
orderSchema.virtual('productQuantities').get(function() {
  const productQuantities = {};

  this.orderDetails.forEach(function(item) {
    const productId = item.productId.toString();

    if (!productQuantities[productId]) {
      productQuantities[productId] = 0;
    }

    productQuantities[productId] += item.quantity;
  });

  return productQuantities;
});
orderSchema.virtual('productTotalValue').get(function() {
  const productTotalValue = {};

  this.orderDetails.forEach(function(item) {
    const productId = item.productId.toString();

    if (!productTotalValue[productId]) {
      productTotalValue[productId] = 0;
    }

    productTotalValue[productId] += item.totalPrice;
  });

  return productTotalValue;
});


// Virtuals in console.log()
orderSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
orderSchema.set("toJSON", { virtuals: true });

const Order = model("Order", orderSchema);
module.exports = Order;
