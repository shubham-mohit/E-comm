const { default: mongoose } = require('mongoose')
const cartModel = require('../model/cartmodel')
const userModel = require('../model/usermodel')
const productModel = require('../model/products')
const ObjectId  = mongoose.Types.ObjectId


let isValid = function (value) {
    if (typeof value === "undefine" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };
  
  
  //*..................................................createCart.............................................................//
  
  const createCart = async function (req, res) {
    try {
      let userId = req.params.userId;
      let reqbody = req.body;
  
      //* validation UserId
      
      if(Object.keys(reqbody).length===0){
          return res.status(400).send({ status: false, message: "Body should Not Be Empty" });
      }
  
  
      if (!ObjectId.isValid(userId)) {
        return res
          .status(400)
          .send({ status: false, message: `${userId} is Invalid UserId` });
      }
      
      let findUserId = await userModel.findById({ _id: userId });
  
      if (!findUserId) {
        return res
          .status(400)
          .send({ status: false, message: "no user exist with this user id" });
      }
  
      // * validation requestBody
  
      let { productId, quantity } = reqbody;
      let data = { userId };
      if (!quantity) {
        quantity = 1;
      }
      if (quantity) {
        quantity = JSON.parse(quantity)
        if (typeof quantity != "number") {
          return res.status(400).send({
            status: false,
            message: "quantity will only consist number",
          });
        }
      }
  
      //* validation productid
  
      if (!isValid(productId)) {
        return res
          .status(400)
          .send({ status: false, message: "product is invalid" });
      }
  
      if (!ObjectId.isValid(productId)) {
        return res
          .status(400)
          .send({ status: false, message: "product is invalid" });
      }
  
      //* validation quantity
  
      data["items"] = [{ productId, quantity }]; // * 
  
      // * finding productBy productId
  
      let getProduct = await productModel.findOne({ _id: productId ,isDeleted:false});
  
      if (getProduct == null) {
        return res.status(404).send({
          status: false,
          message: "no product found with this product id",
        });
      }
      let productprice = getProduct.price;
  
      //* checking if cart present
  
      let presentCart = await cartModel.findOne({ userId: userId });
  
      if (presentCart !== null) {
  
        // * if cart present updating it
  
        //* caluculating total price and total items
  
        presentCart.totalPrice += productprice * quantity;
        data.totalPrice = presentCart.totalPrice;
  
        let newData = [];
        let index = 0;
        let product = 0;
        let number = 0;
  
        for (let i = 0; i < presentCart.items.length; i++) {
          if (presentCart.items[i].productId == productId) {
            index = i;
            product = presentCart.items[i].productId.toString();
            number = presentCart.items[i].quantity;
          } else {
            newData.push(presentCart.items[i]);
          }
        }
  
        if (product == 0) {
          // * if product not present in th cart
          // * updating cart
  
          presentCart.totalItems += 1;
          data.totalItems = presentCart.totalItems;
          let updateCart = await cartModel.findOneAndUpdate(
            { _id: presentCart._id },
            {
              userId: data.userId,
              $addToSet: { items: data.items },
              totalPrice: data.totalPrice,
              totalItems: data.totalItems,
            },
            { new: true }
          ).populate([{ path: "items.productId" }]);
  
          // * sending updated cart
  
          return res
            .status(200)
            .send({ status: true, message: "Success", data: updateCart });
  
        } else if (product !== 0) {
  
          // * if product present in cart
  
          data.totalItems = presentCart.totalItems;
          presentCart.items[index].quantity = number + quantity;
          newData.push(presentCart.items[index]);
          data.items = newData;
  
          // * updating cart
  
          let updateCart = await cartModel.findOneAndUpdate(
            { _id: presentCart._id },
            {
              userId: data.userId,
              $set: { items: data.items },
              totalPrice: data.totalPrice,
              totalItems: data.totalItems,
            },
            { new: true }
          ).populate([{ path: "items.productId" }]);
  
          // * sending updated cart
  
          return res
            .status(200)
            .send({ status: true, message: "Success", data: updateCart });
        }
      } else {
  
        // * if cart not present creating it
  
        // * calculating price and quantity
  
        let totalPrice = quantity * productprice;
        data.totalprice = totalPrice;
  
        let totalItems = quantity;
        data.totalItems = totalItems;
      }
  
      // * creating new cart
  
      let cartCreated = await cartModel.create({
        userId: data.userId,
        items: data.items,
        totalPrice: data.totalprice,
        totalItems: data.totalItems,
      })
      const createdCart=await cartModel.findOne({_id:cartCreated._id}).populate([{ path: "items.productId" }]);
  
      // * sending new cart in response
  
      return res
        .status(201)
        .send({ status: true, message: "Success", data: createdCart });
    } catch (err) {
      res.status(500).send({ status: false, error: err });
    }
  };


  const updateCart = async function (req,res){
    try {
        let userId = req.params.path
        let Data = req.body
        let {cartId, productId,removeProduct} = Data
        if(!cartId) {return res.status(400).send({status:false, message: "CartId is required"})}
        if(!ObjectId.isValid(cartId)) {return res.status(404).send({status:false, message: "Plz enter a valid cartId"})}

        if(!productId) {return res.status(400).send({status:false, message: "productId is required"})}
        if(!ObjectId.isValid(productId)) {return res.status(404).send({status:false, message: "Plz enter a valid productId"})}

        const checkDetails = await cartModel.findOne({_id:cartId, userId:userId, "items.productId":productId}).populate([{path: "items.productId"}])
        if(!checkDetails || checkDetails.totalItems == 0) 
        {return res,status(400).send({status:false, message: "Sorry unable to update data"})}
    
        let arr= []
        let totalPrice = 0
        let final = {}
    
        for(let i=0;i<checkDetails.items.length;i++) {
            if(removeProduct == 0){
                if(checkDetails.items[i].productId == productId){
                    continue;
                }
                else{
                    arr.push(checkDetails.items[i])
                    totalPrice += checkDetails.items[i].productId.price * checkDetails.items[i].quantity
                }
            }
            else {
                if(checkDetails.items[i].productId == productId){
                    checkDetails.items[i].quantity--
                    if(checkDetails.items[i].quantity == 0){
                        continue
                    }
                    else{
                        arr.push(checkDetails.items[i])
                        totalPrice += checkDetails.items[i].productId.price * checkDetails.items[i].quantity
                    }
                }
            }
        }
        final.totalItems = arr.length
        final.totalPrice = totalPrice
        final.items = arr
        const updatedData = await cartId.findOneAndUpdate({_id:cartId},final,{new:true}).populate([{path: "Item.productId"}])
        res.status(200).send({status:true , message: "Success" , data:updatedData})
    } catch (error) {
        res.status(500).send({status:false, error:error.message})
    } 
 }


const getCart = async function(req,res){
    try {
        let userId = req.params.userId
        if(!userId) {return res.status(400).send({status:false, message: "UserId is mandatory"})}
        const checkId = await cartModel.findOne({userId:userId}).populate([{path: "items.productId"}])
        if(!checkId) {return res.status(404).send({status:false, message: "User not found"})}
        else{
            res.status(200).send({status:true , data: checkId})
        }
    } catch (error) {
        res.status(500).send({status:false, error: error.message})
    }
}

const deleteCart = async function(req,res){
    try {
        const checkData = await cartModel.findOne({userId: userId})
        if(! checkData ) {return res.status(404).send({status:false, message: "User not found"})}
        else{
            const deleteUpdate = await cartModel.findOneAndUpdate({userId: userId},{"checkData.totalPrice": 0, items:[] , "checkData.totalItems" : 0}, {new:true})
            res.status(200).send({status:true, Message: "Deleted"})
        }
    } catch (error) {
        res.status(500).send({status:false, Error: error,message})
    }
}


  module.exports = {createCart,getCart,deleteCart,updateCart}