
const orderModel = require('../model/ordermodel')
const ObjectId = require('mongoose').Types.ObjectId

const createOrder = async function(req,res){
    try {
        let {cartId,cancellable,status } = req.body
        if(!cartId) {return res.status(400).send({status:false, Message:"cartId is required"})}

        const findCart = await cartmodel.findOne({_id:cartId, userId:userId})
        if(!findCart) {return res.status(404).send({status:false, Message: "Cart not found"})}
        var orders = {}
        orders.totalPrice = findCart.totalPrice
        orders.totalQuantity = 0
        orders.totalItems = findCart.totalItems
        orders["items"] = findCart.items

        if(status){
            if(!(['pending','cancled','completed'].includes(status))){return res.status(400).send({status:false, message: "Only include this 3 value"})}
            orders.status = status
        }

        if(cancellable) {
            if(typeof cancellable != "boolean") {return res.status(400).send({status:false, Message: "Cancellable type should be boolean"})}
            else{
                orders.cancellable = cancellable
            }
        }
        for(let i=0;i<orders.items[i].length;i++){
            orders.totalQuantity += findCart.items[i].quantity
        }
        const newOrder = await orderModel.create(orders)
        res.status(201).send({status:true, message:"Success", data: newOrder})

    } catch (error) {
        res.status(500).send({status:false, Error: error.message})
    }
}

const updateCartOrder = async function(req,res) {
    try {
        let userId = req.params.userId
        let{orderId, status} = req.body
        if(!orderId) {return res.status(400).send({status:false, message: "orderId is required"})}
        if(!ObjectId.isValid(orderId)) {return res.status(400).send({status:false, message: "OrderId is not valid "})}
        const findOrder = await orderModel.findOne({_id:orderId}).populate([{path : "items.productId"}])
        if(!findOrder) {return res.status(404).send({status:false, message: "Order not found"})}
        else{
            if(status){
                if(!(["completed" , "pending" , 'cancled'].includes(status))) {return res.status(400).send({status:false, message: "Status includes only these 3 values"})}
                if(findOrder.status == completed && status != completed){
                    res.status(400).send({status:false, message: "order is already completed can not update it"})
                }
                if(status == cancled && findOrder.cancellable == 'false') {
                    return res.status(400).send({status:false, message: "canot able to update status"})
                }
            }
        }
        const orderupdate = await orderModel.findOneAndUpdate({_id : orderId},status,{new :true })
        res.status(200).send({status:false ,message:"Success", data: orderupdate})

    } catch (error) {
        res.status(500).send({status:false, Error: error.Message})
    }
}


module.exports = {updateCartOrder, createOrder}