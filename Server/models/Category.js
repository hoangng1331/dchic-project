const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const categorySchema = new Schema({
  name: { type: String, required: [true, "Tên danh mục bắt buộc phải nhập"], unique: true},
},);
//  


const Category = model("Category", categorySchema);

module.exports = Category;
