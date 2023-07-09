const usermodel = require('../model/usermodel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const createuser = async function(req,res){
    let Data = req.body
    let profileImage = req.uploadedFileURL 
    Data.profileImage = profileImage
    try {
        let create = await usermodel.create(Data)
        res.status(201).send({status: true, Message: "User created succesfully", data: create})

    } catch (error) {
        res.status(500).send(error.message)
    }
}

const login = async function(req,res){
    let Data = req.body
    let {email,password} = Data
    try {
        if(!Data) {return res.status(400).send({status:false, message: "Plz enter the data"})}

        if(!email){
            return res.status(400).send({status:false, message: "Plz enter email"})
        }
        const checkEmail = await usermodel.findOne({email:email})
        if(!checkEmail) {return res.status(404).send({status:false, message: "Email not found"})}

        if(!password) {return res.status(400).send({status:false, message:"Plz enter password"})}
        // converting to bcrypt password
        const passwordCheck = bcrypt.compareSync(password,checkEmail.password)
        if(!passwordCheck) {return res.status(404).send({status:false, message:"Password is incorrect"})}

        let Token = jwt.sign({
            userId : checkEmail._id
        },
        "Shubham_key",
        {expiresIn : "100d"},
        { iat: Date.now()}
        )
        return res.status(201).send({status:true, Message: "Login successfully", data:{userId: checkEmail._id, Token}})

    } catch (error) {
        res.status(500).send(error.message)
    }
}

const getUser = async function(req,res){
    let userIdFromParam = req.params.userId
    try {
        const fetchuser = await usermodel.findById(userIdFromParam)
        if(!fetchuser) {return res.status(404).send({ststus:false, message: "User not found"})}
        res.status(200).send({status:false , Message:"User profile details" , data: fetchuser})
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const updateduser = async function(req,res){
    let IdFromParam = req.params.userId
    try {
        const updateInfo = await usermodel.findOneAndUpdate({_id: IdFromParam}, req.Data, {new:true})
        res.status(200).send({status: true, Message: "User profile updated", data: updateInfo})
    } catch (error) {
        res.status(500).send(error.message)
    }
}

module.exports = {createuser,login,getUser,updateduser}