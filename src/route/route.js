const express = require('express')
const router = express.Router()
const {userValid} = require('../validator/uservalidator')
const {createuser,login,getUser,updateduser} = require('../controller/usercontrol')
const {updateuser} = require('../validator/updatevalidation')
const { awsApi } = require('../middleware/aws')
const {authorize} = require('../middleware/auth')
const {createProd,getProd,getProdById,deleteApi} = require('../controller/productcontrol')

router.post('/register', userValid,awsApi,createuser)
router.post('/login', login )
router.get('/user/:userId/profile', authorize, getUser)
router.put('/user/:userId/profile', authorize , updateuser, updateduser)


router.post('/products', awsApi, createProd )
router.get('/products', getProd )
router.get('/products/:productId', getProdById)
router.put('/products/:productId', deleteApi)

module.exports = router