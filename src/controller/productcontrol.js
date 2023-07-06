
const { mongoose } = require('mongoose');
const productModel = require('../model/products')
const ObjectId = mongoose.Types.ObjectId

const isValid = function (value) {
    if (typeof value !== "string" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

const createProd = async function(req,res){
    let Data = req.body
    let productImage = req.uploadedFileURL
    Data.productImage = productImage
    try {
        let {title, description,price,currencyId,currencyFormat,isFreeShipping,style,deletedAt,isDeleted,availableSizes,installment} = Data
        console.log("Hi")
        if(!isValid(title)) {return res.status(400).send({status: false, message: "Title is required"})}
        const checkDuplicate = await productModel.findOne({title: title})
        if(checkDuplicate) {return res.status(400).send({status: false, message:"Please try another title already in use"})}

        if(!isValid(description)) {return res.status(400).send({status:false, message: "Description is required"})}
        console.log("hi")

        if(!price) {return res.status(400).send({status:false, message: "Price is required"})}
        if(typeof price != "number") {return res.status(400).send({status:false, message: "Price type not correct"})}

        if(isValid(currencyId)) {return res.status(400).send({status:false, message: "CurrencyId is required "})}
        if(currencyId != "INR") {return res.status(400).send({status: false, message: "CurrencyId is not not Right"})}

        if(!isValid(currencyFormat)) {return res.status(400).send({status: false, message: "CurrencyFormat is required "})}
        if(currencyFormat != "₹") {return res.status(400).send({status:false, message: "Currecy format is not Right"})}

        if(isFreeShipping) {
            if(typeof isFreeShipping != "boolean") {return res.status(400).send({status:false , message: "IsFreeShipping type should be boolean"})}
        }

       if(!availableSizes && availableSizes == "") {return res.status(400).send({status:false, message: "availablesize is required"})}
       let array = availableSizes.split(",").map((x) => x.toUpperCase())
       if(array.length < 1) {return res.status(400).send({status:false, message: "atleast one content"})}
        if(!array.includes(["S", "XS","M","X", "L","XXL", "XL"])) {return res.status(400).send({status:false, message: "Invalid size"})}
       if(Array.isArray(array)){
        let addElement = new Set(array)
        let result = [...addElement]
        Data.availableSizes = result
       }
       if(installment) {
        if(typeof installment != "number") {return res.status(400).send({status:false, message: "Installment type should be number"})}
       }
       if(deletedAt){
        if(deletedAt != Date) {return res.status(400).send({status:false, message:"Format should be Data"})}
       }

       if(isDeleted){
        if(typeof isDeleted != 'boolean') {return res.status(400).send({status:false, messae: "isDeleted type should be boolean"})}
       }
       const createproduct = await productModel.create(Data)
       res.status(200).send({status:true, data:createproduct})


        } catch (error) {
        res.status(500).send( error.message)
    }
}


////////////////////////////////////////////// get api //////////////////////////////////////////////////

const getProd = async function(req,res){

    try {
        let Data = req.query
        let filter = {}
        let {size,name,priceGreaterThan,priceLessThan,priceSort} = Data
        if(size){
            filter.availableSizes = {$in : size.split(" ").map((x)=> x.toUpperCase())}
        }
        if(name) {
            filter.title = {$regex : ".*" + name + ".*"} 
        }
        if(priceGreaterThan) {
            filter.price = {$gt : priceGreaterThan}
        }
        if(priceLessThan) {
            filter.price = {$lt : priceLessThan}
        }
        if(priceLessThan && priceGreaterThan) {
            filter.price = {$and : [{$gt: priceGreaterThan} , {$lt:priceLessThan}]}
        }
        if(priceSort == 1){
            const searchData = await productModel.find(filter,{isDeleted: false}).sort({price:1})
        }
        if(priceSort == -1) {
            const searchData = await productModel.find(filter, {isDeleted: false}).sort({price:1})
        }
        if(searchData.length > 0) {
            res.status(200).send({status: false, message: "Succes" , data:searchData })
        }
        else{
            return res.status(404).send({status:false , message: "No Data found"})
        }

    } catch (error) {
        res.status(500).send(error.message)
    }
}

//////////////////////////////////// get api by id //////////////////////////////////////////

const getProdById = async function(req,res){
    try {
        let IdFromParams = req.params.productId
        if(!mongoose.isValidObjectId(IdFromParams)) {return res.status(400).send({status:false, message: "ObjectId is not valid"})}

        const checkData = await productModel.findOne({_id:IdFromParams , isDeleted:false})
        if(!checkData) {return res.status(404).send({status:false, message: "No data found"})}
        else{
            res.status(200).send({status:true, message:"Success" , data:checkData})
        }
        
    } catch (error) {
        res.status(500).send(error.message)
    }
}

////////////////////////////////    delete api  ////////////////////////////////////////

const deleteApi = async function(req,res) {
    try {
        let IdFromParam = req.params.productId
        if(mongoose.isValidObjectId(IdFromParam)) {return res.status(400).send({status:false, message: "ObjectId is not valid"})}

        const checkId = await productModel.findById(IdFromParam)
        if(!checkId) {return res.status(404).send({status:false, message:"No data found"})}
        
        const deleteprod = await productModel.findOneAndUpdate({_id:IdFromParam, isDeleted:false},{isDeleted: true, deletedAt: Date.now()}, {new:true})
         
        if(deleteprod){
            res.status(200).send({status: true, message: "Deleted Succesfully"})
        }
        else{
            res.status(404).send({status:false, message: "Product already deleted"})
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}



module.exports = {createProd,getProd,getProdById,deleteApi}