const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const productSchema = Schema(
  {
    name: { type: String, required: true, unique: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    description: { type: String, required: false },
    preserveGuide: { type: String, required: false },
    promotion: {
      type: String,
      required: true,
      default: "No",
      validate: {
        validator: (value) => {
          if (["Yes", "No"].includes(value)) {
            return true;
          }
          return false;
        },
        message: `Status: {VALUE} is invalid!`,
      },
    },
    variants: {
      type: [
        {
          colorId: {
            type: Schema.Types.ObjectId,
            ref: "Color",
            required: false,
          },
          sizes: {
            type: [
              {
                sizeId: {
                  type: Schema.Types.ObjectId,
                  ref: "Size",
                  required: false,
                },
                quantity: { type: Number, min: 0, default: 0, required: false },
              },
            ],
          },
          price: { type: Number, min: 0, default: 0, required: false },
          discount: { type: Number, min: 0, default: 0, required: false },
          imageUrl: Array,
        },
      ],
      required: true,
    },

  },
  {
    versionKey: false,
  }
);

// Virtual for total quantity
productSchema.virtual("stock").get(function () {
  return this.variants.reduce((total, color) => {
    return (
      total +
      color.sizes.reduce((acc, size) => {
        return acc + size.quantity;
      }, 0)
    );
  }, 0);
});

productSchema.virtual("stockByColor").get(function () {
  const totalQuantityByColor = {};
  this.variants.forEach((variant) => {
    const colorId = variant.colorId.toString();
    let totalQuantity = 0;
    variant.sizes.forEach((size) => {
      totalQuantity += size.quantity;
    });
    totalQuantityByColor[colorId] = totalQuantity;
  });
  return totalQuantityByColor;
});
// // Virtual with Populate
productSchema.virtual("category", {
  ref: "Category",
  localField: "categoryId",
  foreignField: "_id",
  justOne: true,
});

productSchema.virtual("color", {
  ref: "Color",
  localField: "variants.colorId",
  foreignField: "_id",
  justOne: false,
});

productSchema.virtual("size", {
  ref: "Size",
  localField: "variants.sizes.sizeId",
  foreignField: "_id",
  justOne: false,
});

// Include virtuals

// Virtuals in console.log()
productSchema.set("toObject", { virtuals: true });
// Virtuals in JSON
productSchema.set("toJSON", { virtuals: true });

const Product = model("Product", productSchema);

module.exports = Product;
