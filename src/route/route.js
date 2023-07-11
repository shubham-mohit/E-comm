const express = require('express')
const router = express.Router()
const {userValid} = require('../validator/uservalidator')
const {createuser,login,getUser,updateduser} = require('../controller/usercontrol')
const {updateuser} = require('../validator/updatevalidation')
const { awsApi } = require('../middleware/aws')
const {authorize} = require('../middleware/auth')
const {createProd,getProd,getProdById,deleteApi,updateProd} = require('../controller/productcontrol')
const {createCart,getCart,deleteCart,updateCart} = require('../controller/cartcontroller')
const {updateCartOrder, createOrder} = require('../controller/ordercontrol')

router.post('/register', userValid,awsApi,createuser)
router.post('/login', login )
router.get('/user/:userId/profile', authorize, getUser)
router.put('/user/:userId/profile', authorize , updateuser, updateduser)


router.post('/products', awsApi, createProd )
router.get('/products', getProd )
router.get('/products/:productId', getProdById)
router.delete('/products/:productId', deleteApi)
router.put('/products/:productId', updateProd)


router.post('/users/:userId/cart', authorize , createCart )
router.put('/users/:userId/cart', authorize , updateCart)
router.get('/users/:userId/cart', authorize , getCart)
router.delete('/users/:userId/cart', authorize, deleteCart)


router.post('/users/:userId/orders', authorize, createOrder)
router.put('/users/:userId/orders', authorize, updateCartOrder)

module.exports = router