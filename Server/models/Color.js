const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const colorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true},
  hexcode: 
  {type: [
    {
    hex: { type: String, required: true, unique: true },
    hsl: { type:[{
      a: { type: Number},
      h: { type: Number},
      l: { type: Number},
      s: { type: Number}}]},
    hsv: { type:[{
        a: { type: Number},
        h: { type: Number},
        s: { type: Number},
        v: { type: Number}}]},  
    oldHue: { type: Number},
    rgb: { type:[{
      a: { type: Number},
      b: { type: Number},
      g: { type: Number},
      r: { type: Number}}]},
    source: {type: String}
  }], required: true}
});
const Color = model('Color', colorSchema);
module.exports = Color;
