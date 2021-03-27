const express = require('express');
const bodyParser = require('body-parser');

let moment = require('moment');
const melonn = require('../services/melonn');

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

const getNextBussinessDays = async () => {
    const response = await melonn.getOffDaysList();
    
    if (response.success) {
        const nextDays = [];

        for (let i = 0; i < 10; i++) {
            let date = new Date();
            date.setDate(date.getDate() + i);
            nextDays.push(moment(date).format('YYYY-MM-DD'));
        }

        const nextBusinessDays = nextDays.filter(item => response.offDays.indexOf(item) === -1);

        return nextBusinessDays;
    }
}

const getRules = async (orderId) => {
    const response = await melonn.getMethodDetails(orderId);

    if (response.success) {
        return response.method.rules;
    }
}

const getValidateWeight = (rules, weight) => {
    let min = rules.availability.byWeight.min;
    let max = rules.availability.byWeight.max;
    
    if (weight <= max && weight >= min) {
        return true;
    }

    return false;
}

const getValidateBusinessDay = (nextBusinessDays) => {
    const boolean = nextBusinessDays.some(item => item === moment(new Date()).format('YYYY-MM-DD'));

    return boolean;
}

const promiseNull = () => {
    return({
        pack_promise_min: null,
        pack_promise_max: null,
        ship_promise_min: null,
        ship_promise_max: null,
        delivery_promise_min: null,
        delivery_promise_max: null,
        ready_pickup_promise_min: null,
        ready_pickup_promise_max: null,
    });
}

orderRouter.route('/promises')
.get(async (req, res) => {
    try {
        const nextBusinessDays = await getNextBussinessDays();
        const rules = await getRules(1);    // id order
        const validateWeight = getValidateWeight(rules, 100); // weight order
        const validateBusinessDay = getValidateBusinessDay(nextBusinessDays);

        if (!validateWeight) {
            res.send(promiseNull());

            return false;
        }

        const dayType = rules.availability.byRequestTime.dayType;
        const fromTimeOfDay = rules.availability.byRequestTime.fromTimeOfDay;
        const toTimeOfDay = rules.availability.byRequestTime.toTimeOfDay;

        switch (dayType) {
            case 'ANY':
                
                break;

            case 'BUSINESS':
            
                break;

            case 'NON-BUSINESS':
                console.log('NOT FOR NOW');
                break;

            case 'WEEKEND':
                console.log('NOT FOR NOW');
                break;
        
            default:
                break;
        }

        console.log(validateBusinessDay);
        console.log(nextBusinessDays);
        console.log(validateWeight);
        res.send('promises');
    } 
    catch (error) {
        console.log(error);
    }
});

module.exports = orderRouter;