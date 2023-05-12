const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const autoIncrement = require("mongoose-auto-increment");
// const AutoIncrement = require('mongoose-sequence')(mongoose);
  autoIncrement.initialize(mongoose.connection);

const categorySchema = new Schema({
  name: { type: String, required: [true, "Tên danh mục bắt buộc phải nhập"], unique: true},
},);
//  
// categorySchema.plugin(autoIncrement.plugin, {
//   model: "Category",
//   field: "_id",
//   startAt: 1,
//   incrementBy: 1, 
//   });

//   categorySchema.pre('save', function (next) {
//     let doc = this;
//     // Check if the document is new
//     if (doc.isNew) {
//       if(doc.category=="Áo"){
//       let b =(doc._id).toString().padStart(6, '0');
//       doc._id = 'A'+b ;
//     } else {let b =(doc._id).toString().padStart(6, '0');
//     doc._id = b ;}}
//     next();
//   });

const Category = model("Category", categorySchema);
// const Category = mongoose.model("Category", categorySchema);
// RESET pId
// Category.resetCount(function(err, nextCount) {
//   console.log('Auto-increment has been reset!'); 
// });
module.exports = Category;
