
const productModel = require('../model/products')

const isValid = function (value) {
    if (typeof value !== "string" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

const createProd = async function(req,res){
    let Data = req.body
    try {
        let {title, description,price,currencyId,currencyFormat,isFreeShipping,productImage,style,deletedAt,isDeleted,availableSizes,installment} = Data
        if(!isValid(title)) {return res.status(400).send({status: false, message: "Title is required"})}
        const checkDuplicate = await productModel.findOne({title: title})
        if(checkDuplicate) {return res.status(400).send({status: false, message:"Please try another title already in use"})}

        if(!isValid(description)) {return res.status(400).send({status:false, message: "Description is required"})}

        if(!price) {return res.status(400).send({status:false, message: "Price is required"})}
        if(typeof price != "number") {return res.status(400).send({status:false, message: "Price type not correct"})}

        if(isValid(currencyId)) {return res.status(400).send({status:false, message: "CurrencyId is required "})}
        if(currencyId != "INR") {return res.status(400).send({status: false, message: "CurrencyId is not not Right"})}

        if(!isValid(currencyFormat)) {return res.status(400).send({status: false, message: "CurrencyFormat is required "})}
        if(currencyFormat != "₹") {return res.status(400).send({status:false, message: "Currecy format is not Right"})}

        if(isFreeShipping) {
            if(typeof isFreeShipping != "Boolean") {return res.status(400).send({status:false , message: "IsFreeShipping type should be boolean"})}
        }

       if(!availableSizes && availableSizes == "") {return res.status(400).send({status:false, message: "availablesize is required"})}
       

        } catch (error) {
        res.status(500).send({status: false, Error: error.message})
    }
}