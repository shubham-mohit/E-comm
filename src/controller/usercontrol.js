const usermodel = require('../model/usermodel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const createuser = async function(req,res){
    let Data = req.body
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
        if(!Data) {return res.status(400).send({status:false, message: "Plz enternthe data"})}

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
        {expiresIn : "365d"},
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
        res.status(200).send({status:false , Message:"User profile details" , data: fetchuser})
    } catch (error) {
        res.status(500).send(error.message)
    }
}

const updateuser = async function(req,res){
    
}

module.exports = {createuser,login,getUser}