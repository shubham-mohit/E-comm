const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const userModel = require('../model/usermodel')
const jwt = require('jsonwebtoken')


const authorize = async function(req,res,next){
    let userIdFromParam = req.params.userId
    try {
        if(!ObjectId.isValid(userIdFromParam)) {return res.status(400).send({status: false, message: "Invalid objectId"})}
        const checkUser = await userModel.findOne({_id:userIdFromParam})
        if(!checkUser) {return res.status(404).send({status: false, message: "User not found"})}

        if(!req.headers.authorization) {return res.status(400).send({status: false, message: "Header is not present"})}

        let Token = req.headers.authorization
        if(!Token) {return res.status(400).send({status: false, message: "Token is not present" })}

        let decodeToken = jwt.verify(Token, "shubham_key" )
        if(!decodeToken){return res.status(401).send({status:false, message: "Token is not valid"})}
        else{
            req.userId = decodeToken.userId
            if(req.userId != userIdFromParam) {return res,status(403).send({status:false, message: "Unauthorized"})}
            else{
                next()
            }
        }
    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = {authorize}