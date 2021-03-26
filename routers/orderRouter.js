const express = require('express');
const bodyParser = require('body-parser');
let moment = require('moment');

const orderRouter = express.Router();
orderRouter.use(bodyParser.json());

const orderList = [];
let id = 0;

orderRouter.route('/')
.get(async (req, res) => {
    try {
        res.send(orderList);
    } 
    catch (error) {
        console.log(error);
    }
})
.post(async (req, res) => {
    try {
        id = id + 1;
        const order = req.body;
        order.id = id;
        order.date = moment(new Date()).format('YYYY-MM-DD');
        order.orderNumberInternal = 'MSE' + Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 100);
        orderList.push(order);
        console.log(order)
        res.send(order);
    } 
    catch (error) {
        console.log(error);
    }
});

orderRouter.route('/:id')
.delete(async (req, res) => {
    try {
        let id = parseInt(req.params.id);
        let index = orderList.map(item => {return item.id;}).indexOf(id);
        index !== -1 && orderList.splice(index, 1);
        res.send('order deleted');
    } 
    catch (error) {
        console.log(error);
    }
});

module.exports = orderRouter;