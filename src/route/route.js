const express = require('express')
const router = express.Router()
const {userValid} = require('../validator/uservalidator')
const {createuser,login,getUser,updateuser} = require('../controller/usercontrol')
const updatevalidator = require('../validator/updatevalidation')
const { awsApi } = require('../middleware/aws')
const {auth} = require('../middleware/auth')

router.post('/register', userValid,awsApi,createuser)
router.post('/login', login )


module.exports = router