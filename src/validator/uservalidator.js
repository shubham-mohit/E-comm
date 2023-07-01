const userModel = require("../model/usermodel")
const validator = require('validator')
const bcrypt = require('bcrypt')
const mobileregex = " ^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[6789]\d{9}$ " 
const pincoderegex = "^[1-9][0-9]{5}$ " 

const isValid = function (value) {
    if (typeof value !== "string" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  }

const userValid = async function(req,res){
    let Data = req.body
    let {fname,lname,email,phone,password,address} = Data
    if(Object.keys(Data).length == 0) {
        return res.status(400).send({status:false, message:"Data is required"})
    }
    try {
        if(!isValid(fname)){return res.status(400).send({status:false, message: "Firstname is required"})}
        if(!isValid(lname)){return res.status(400).send({status:false, message: "Lasttname is required"})}

        if(!isValid(email)){
            return res.status(400).send({status:false, message: "Email is required"})
        }
        if(validator.validate(email)){
            return res.status(400).send({status:false, message:"Email format is not accurate"})
        }
        const CheckEmail = await userModel.findOne({email:email})
        if(CheckEmail){
            return res.status(400).send({status:false, message: "Email already in use"})
        }

        // Phone validation
        if(!isValid(phone)){
            return res.status(400).send({status:false, message: "Phone no is required"})
        }
        if(!mobileregex.test(phone)){
            return res.status(400).send({status:false, message: "Phone format is not valid"})
        }
        const checkPhone = await userModel.findOne({phone:phone})
        if(checkPhone){
            return res.status(400).send({status:false, message: "Phone already in use"})
        }

        // Password
        if(!isValid(password)){
            return res.status(400).send({status:false, message: "Password is requird"})
        }
        if(!(password.length > 8 && password.length < 16)){
            return res.status(400).send({status:false, message: "Password is not correct"})
        }
        var saltRound = 10
        const Hash = bcrypt.hashSync(password, saltRound)
        Data.password = Hash

        // Validation for address
        if(typeof address !== "object") {return res.status(400).send({status:false, message: "Address should be in Key-Value pair"})}
        if(!Object.keys(address).length) {return res.status(400).send({status:false, message: "Plz enterd something inside address"})}

        let {shipping,billing} = address
        if(!address.hasOwnProperty(shipping)) {return res.status(400).send({status:false, message: "Shipping is required"})}

        
        if(typeof shipping !== "object") {return res.status(400).send({status:false, message: "shipping should be in key value pair"})}
        if(shipping.hasOwnProperty("street")) {return res.status(400).send({status:false, message: "Street is mandatory "})}
        if(shipping.hasOwnProperty("city")) {return res.status(400).send({status:false, message: "City is mandatory "})}
        if(shipping.hasOwnProperty("pincode")) {return res.status(400).send({status:false, message: "Pincode is mandatory"})}

        if(!isValid(shipping.street)) {return res.status(400).send({status:false, message: "Invalid street type "})}
        if(!isValid(shipping.city)) {return res.status(400).send({status:false, message: "Invalid street type "})}
        if(pincoderegex.test(shipping.pincode)) {return res.status(400).send({status:false, message: "Invalid pincode format"})}

        if(typeof billing !== "object") {return res.status(400).send({status:false, message: "Billing should be in key value pair"})}
        if(billing.hasOwnProperty("street")) {return res.status(400).send({status:false, message: "Street is mandatory "})}
        if(billing.hasOwnProperty("city")) {return res.status(400).send({status:false, message: "City is mandatory "})}
        if(billing.hasOwnProperty("pincode")) {return res.status(400).send({status:false, message: "Pincode is mandatory"})}

        if(!isValid(billing.street)) {return res.status(400).send({status:false, message: "Invalid street type "})}
        if(!isValid(billing.city)) {return res.status(400).send({status:false, message: "Invalid street type "})}
        if(pincoderegex.test(billing.pincode)) {return res.status(400).send({status:false, message: "Invalid pincode format"})}

        Data.address = address
        next()

    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = {userValid}