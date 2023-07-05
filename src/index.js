const express = require('express');
const mongoose = require('mongoose');
const route = require("../src/route/route")
const app = express()
const multer = require('multer')

app.use(express.json())
app.use(express.urlencoded({extended:true}))

mongoose.connect("mongodb+srv://sourabhamohite2812:wXzbwlWssiEAjJL1@cluster0.m7awpol.mongodb.net/shubham-22" , {useNewUrlParser: true})
.then(()=> console.log("MongoDB is connected"))
.catch((err)=> err.message)

app.use(multer().any())
app.use("/", route)

app.listen(process.env.PORT || 8000, ()=>{
    console.log("Express app running on PORT ", process.env.POR ||  8000)
})