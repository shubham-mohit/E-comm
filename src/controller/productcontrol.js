
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
        let {title, description,price,currencyId,currencyFormat,isFreeShipping,deletedAt,isDeleted,availableSizes,installment} = Data
        // console.log("Hi")
        if(!isValid(title)) {return res.status(400).send({status: false, message: "Title is required"})}
        const checkDuplicate = await productModel.findOne({title: title})
        if(checkDuplicate) {return res.status(400).send({status: false, message:"Please try another title already in use"})}

        if(!isValid(description)) {return res.status(400).send({status:false, message: "Description is required"})}
        // console.log("hi")

        if(!price) {return res.status(400).send({status:false, message: "Price is required"})}
        price = JSON.parse(price)
        if(typeof price != "number") {return res.status(400).send({status:false, message: "Price type not correct"})}

        if(!isValid(currencyId)) {return res.status(400).send({status:false, message: "CurrencyId is required "})}
        if(currencyId != "INR") {return res.status(400).send({status: false, message: "CurrencyId is not not Right"})}

        if(!isValid(currencyFormat)) {return res.status(400).send({status: false, message: "CurrencyFormat is required "})}
        if(currencyFormat != "₹") {return res.status(400).send({status:false, message: "Currecy format is not Right"})}

        if(isFreeShipping) {
            if(typeof isFreeShipping != "boolean") {return res.status(400).send({status:false , message: "IsFreeShipping type should be boolean"})}
        }

       if(!availableSizes && availableSizes == "") {return res.status(400).send({status:false, message: "availablesize is required"})}
       let array = availableSizes.split(",").map((x) => x.toUpperCase())
       for(let i=0;i<array.length;i++){
       console.log(array)
       if(array.length < 1) {return res.status(400).send({status:false, message: "atleast one content"})}
       if(!(['S','XS','M','X', 'L','XXL', 'XL'].includes(array[i]))) {return res.status(400).send({status:false, message: "Invalid size"})}
        }
       if(Array.isArray(array)){
        let addElement = new Set(array)
        let result = [...addElement]
        Data.availableSizes = result
       }
       if(installment) {
        installment = JSON.parse(installment)
        if(typeof installment != 'number') {return res.status(400).send({status:false, message: "Installment type should be number"})}
       }
       if(deletedAt){
        if(deletedAt != Date) {return res.status(400).send({status:false, message:"Format should be Date"})}
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
       
            const searchData = await productModel.find(filter,{isDeleted: false}).sort({price:priceSort})
       
        if(searchData.length != 0) {
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
        if(!Object.isValid(IdFromParams)) {return res.status(400).send({status:false, message: "ObjectId is not valid"})}

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
        if(!ObjectId.isValid(IdFromParam)) {return res.status(400).send({status:false, message: "ObjectId is not valid"})}

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

const updateProd = async function(req,res) {
    try {
        let Data = req.body
        let productId = req.params.productId
        let {title, description,price,currencyId,currencyFormat,isFreeShipping,deletedAt,isDeleted,availableSizes,installment} = Data
        if(title) {
           if(!isValid(title)) {return res.status(400).send({status:false, message: "Title type is invalid"})}
           const checkDulicate = await productModel.findOne({title: title})
           if(checkDulicate) {return res.status(400).send({status:false, message: "title already in use try some different name"})}
        }

        if(description) {
            if(!isValid(description)) {return res.status(400).send({status:false, message: "Invalid description type"})}
        }

        if(price) {
            price = JSON.parse(price)
            if(typeof price != "number") {return res.status(400).send({status:false, message: "Price type should be no"})}
        }

        if(currencyId) {
            if(currencyId != "INR") {
                return res.status(400).send({status:false, message: "CurrencyID is not in right format" })
            }
        }

        if(currencyFormat) {
            if(currencyFormat != "₹") {return res.status(400).send({status:false, message: "not valid currencyFormat"})}
        }

        if(isFreeShipping) {
            if(typeof isFreeShipping != 'boolean') {return res.status(400).send({status:false, message: "shipping type should be boolean"})}
        }

        if(availableSizes) {
            let array = availableSizes.split(",").map((x)=> x.toUpperCase())
            if(array.length < 1) {return res.status(400).send({status:false, message: "Atleast one element is required"})}
            for(let i=0;i<array.length;i++){
                if(!(['S','XS','M','X', 'L','XXL', 'XL'].includes(array[i]))) {return res.status(400).send({status:false, message: "Invalid size"})}
            }
            if(Array.isArray(array)){
                let addElement = new Set(array)
                let result = [...addElement]
                Data.availableSizes = result
            }
        }

        if(installment) {
            installment = JSON.parse(installment)
            if(typeof installment != 'number') {return res.status(400).send({status:false, message: 'Installment type should be number'})}
        }

        if(deletedAt) {
            if(typeof deletedAt != 'Date') {return res.status(400).send({status:false, message:"Deleted at format should be DATE"})}
        }

        if(isDeleted) {
            if(typeof isDeleted != 'boolean') {return res.status(400).send({status:false, message: "deleted type should be boolean"})}
        }

        const updatedProducts = await productModel.findOneAndUpdate({_id:productId}, Data, {new:true})
        res.status(200).send({status:false, message:updatedProducts})
    } catch (error) {
        res.status(500).send({status:false, Error:error.message})
    }
}

module.exports = {createProd,getProd,getProdById,deleteApi,updateProd}