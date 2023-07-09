const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    userId: {type: ObjectId, ref:"Newuser", required:true},
  items: [{
    productId: {type: ObjectId, ref:"Newproduct", required:true},
    quantity: {type: Number, required: true}
  }],
  totalPrice: {type: Number, required:true},
  totalItems: {type: Number, required:true},
},{timestamps: true})


module.exports = mongoose.model("newcart" , cartSchema)