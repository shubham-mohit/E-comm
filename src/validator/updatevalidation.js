const userModel = require('../model/usermodel')
const validator = require('validator')
const pincoderegex = "^[1-9][0-9]{5}$ " 
const mobileregex = " ^(?:(?:\+|0{0,2})91(\s*[\ -]\s*)?|[0]?)?[6789]\d{9}$ "
const {uploadFile} = require('../middleware/aws') 
const bcrypt = require('bcrypt')


const isValid = function (value) {
    if (typeof value !== "string" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  }


const updateuser = async function(req,res,next){
    const IdFromParam = req.params.userId
    let profileImage = req.files
    try {
        let Data = req.body
        let {fname,lname,email,phone,password,address} = Data
        if(!Data) {return res.status(400).send({status: false, message: "Please enter something in Body."})}
        if(fname){
           if(fname == "") {return res.status(400).send({status: false, message: "Enter valid first Name"})} 
        }
        if(lname){
            if(lname == "") {return res.status(400).send({status: false, message: "Enter valid first Name"})} 
         }
         if(email){
            if(email == "") {return res.status(400).send({status: false, message: "Enter Email-Id"})}
            if(! validator.validate(email)) {return res.status(400).send({status:false, message: "email is not valid"})}
            const CheckEmail = await userModel.findOne({email: email})
            if(CheckEmail) {return res.status(400).send({status: false, message: "Email already in use"})}
         }
         if(phone){
            if(phone == "") {return res.status(400).send({status:false, message: "Enter phone no"})}
            if(! mobileregex.test(phone)) {return res.status(400).send({status:false, message: "Enter valid Indian mobile number "})}
            const checkMobile = await userModel.findOne({phone: phone})
            if(checkMobile) {return res.status(400).send({status:false, message: "Mobile already in use"})}
         }
         if(password){
            if(password == "") {return res.status(400).send({status:false, message: "Please enter the password"})}
            if(!(password.length > 7 && password.length < 16 )) {return res.status(400).send({status: false, message: "Enter strong password"})}

            var saltRound = 10;
            const Hash = bcrypt.hashSync(password, saltRound)
            Data.password = Hash
         }
         if(address){
            if(typeof address != "object") {return res.status(400).send({status:false, message: "Address should be in key-value pair"})}
            if(! Object.keys(address).length) {return res.status(400).send({status:false , message: "address have property like shipping and billing"})}

            if(address.shipping) {
                let {pincode, city, street} = address.shipping
                if(address.shipping.hasOwnProperty(city)){
                    Data.address.shipping.city = city
                }
                if(address.shipping.hasOwnProperty(street)){
                    Data.address.shipping.street = street
                }
                if(address.shipping.hasOwnProperty(pincode)){
                    if(!pincoderegex.test(pincode)){return res.status(400).send({status: false, message: "Pincode format is not valid "})}
                    Data.address.shipping.pincode = pincode
                }
            }
            if(address.billing){
                let {pincode,city,street} = address.billing
                if(address.billing.hasOwnProperty(city)){
                    Data.address.billing.city = city
                }
                if(address.billing.hasOwnProperty(street)){
                    Data.address.billing.street = street
                }
                if(address.billing.hasOwnProperty(pincode)){
                    if(!pincoderegex.test(pincode)){return res.status(400).send({status: false, message: "Pincode format is not valid "})}
                    Data.address.billing.pincode = pincode
                }
            }
         }
         if(Data.profileImage){
            if(Data.profileImage == "") {return res.status(400).send({status: false, message: "Enter profileImage "})}
            if (/\.(gif|jpe?g|tiff?|png|webp|bmp|jfif)$/i.test(profileImage[0].originalname)) {
                return res.status(400).send({status:false, message: "Image should be in jpj,png format"})
            }
            const proImage = async function(req,res){
                if(profileImage.length > 0) {
                    let uploadFileUrl = await uploadFile(profileImage[0])
                    return uploadFileUrl
                }else{
                    return res.status(400).send({status: false , message: "No file found"})
                }
            }
            Data.profileImage = await proImage()
         }
         req.Data = Data
         next()

    } catch (error) {
        res.status(500).send(error.message)
    }

}