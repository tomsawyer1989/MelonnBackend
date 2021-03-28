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

orderRouter.route('/methods/')
.get(async (req, res) => {
    try {
        const response = await melonn.getMethodsList();

        if (response.success) {
            res.send(response.methods);
        }
    } 
    catch (error) {
        console.log(error);
    }
});

const getWeightTotal = (idOrder) => {
    const order = orderList.filter(item => item.id == idOrder);

    return order[0].lineItems.reduce((total, value) => Number(total.weight) + Number(value.weight));
}

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

const getRules = async (methodId) => {
    const response = await melonn.getMethodDetails(methodId);

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

const getValidateBusinessDay = (nextBusinessDays, nowDateTime) => {
    const boolean = nextBusinessDays.some(item => item === nowDateTime);

    return boolean;
}

const getValidateTimeOfDay = (fromTimeOfDay, toTimeOfDay) => {
    let hour = moment(new Date()).format('H');

    if (hour <= toTimeOfDay && hour >= fromTimeOfDay) {
        return true;
    }

    return false;
}

const getPromise = (type, nowDateTime, deltaHours, nextBusinessDays, deltaBusinessDays, timeOfDay) => {
    let promise = null;

    switch (type) {
        case 'NULL':
            promise = null;
            break;

        case 'DELTA-HOURS':
            promise = nowDateTime + deltaHours;
            break;

        case 'DELTA-BUSINESSDAYS':
            let date = nextBusinessDays[deltaBusinessDays - 1];
            let time = timeOfDay;
            promise = date + ' at ' + time;
            break;
    
        default:
            break;
    }

    return promise;
}

const casesListBucle = (caseItem, validateBusinessDay, nowDateTime, nextBusinessDays) => {
    const dayType = caseItem.condition.byRequestTime.dayType;
    const fromTimeOfDay = caseItem.condition.byRequestTime.fromTimeOfDay;
    const toTimeOfDay = caseItem.condition.byRequestTime.toTimeOfDay;

    const validateTimeOfDay = getValidateTimeOfDay(fromTimeOfDay, toTimeOfDay);

    switch (dayType) {
        case 'BUSINESS':
            if (!validateBusinessDay) {
                return false;
            }
            break;

        case 'NON-BUSINESS':
            console.log('NOT FOR NOW');
            return false;

        case 'WEEKEND':
            console.log('NOT FOR NOW');
            return false;
    
        default:
            break;
    }

    if (!validateTimeOfDay) {
        return false;
    }

    const workingCase = caseItem;

    let minType = workingCase.packPromise.min.type;
    let minDeltaHours = workingCase.packPromise.min.deltaHours;
    let minDeltaBusinessDays = workingCase.packPromise.min.deltaBusinessDays;
    let minTimeOfDay = workingCase.packPromise.min.timeOfDay;
    let maxType = workingCase.packPromise.max.type;
    let maxDeltaHours = workingCase.packPromise.max.deltaHours;
    let maxDeltaBusinessDays = workingCase.packPromise.max.deltaBusinessDays;
    let maxTimeOfDay = workingCase.packPromise.max.timeOfDay;

    let packPromiseMin= getPromise(minType, nowDateTime, minDeltaHours, nextBusinessDays, minDeltaBusinessDays, minTimeOfDay);
    let packPromiseMax= getPromise(maxType, nowDateTime, maxDeltaHours, nextBusinessDays, maxDeltaBusinessDays, maxTimeOfDay);

    minType = workingCase.shipPromise.min.type;
    minDeltaHours = workingCase.shipPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.shipPromise.min.deltaBusinessDays;
    minTimeOfDay = workingCase.shipPromise.min.timeOfDay;
    maxType = workingCase.shipPromise.max.type;
    maxDeltaHours = workingCase.shipPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.shipPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.shipPromise.max.timeOfDay;

    let shipPromiseMin= getPromise(minType, nowDateTime, minDeltaHours, nextBusinessDays, minDeltaBusinessDays, minTimeOfDay);
    let shipPromiseMax= getPromise(maxType, nowDateTime, maxDeltaHours, nextBusinessDays, maxDeltaBusinessDays, maxTimeOfDay);

    minType = workingCase.deliveryPromise.min.type;
    minDeltaHours = workingCase.deliveryPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.deliveryPromise.min.deltaBusinessDays;
    minTimeOfDay = workingCase.deliveryPromise.min.timeOfDay;
    maxType = workingCase.deliveryPromise.max.type;
    maxDeltaHours = workingCase.deliveryPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.deliveryPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.deliveryPromise.max.timeOfDay;

    let deliveryPromiseMin= getPromise(minType, nowDateTime, minDeltaHours, nextBusinessDays, minDeltaBusinessDays, minTimeOfDay);
    let deliveryPromiseMax= getPromise(maxType, nowDateTime, maxDeltaHours, nextBusinessDays, maxDeltaBusinessDays, maxTimeOfDay);

    minType = workingCase.readyPickUpPromise.min.type;
    minDeltaHours = workingCase.readyPickUpPromise.min.deltaHours;
    minDeltaBusinessDays = workingCase.readyPickUpPromise.min.deltaBusinessDays;
    minTimeOfDay = workingCase.readyPickUpPromise.min.timeOfDay;
    maxType = workingCase.readyPickUpPromise.max.type;
    maxDeltaHours = workingCase.readyPickUpPromise.max.deltaHours;
    maxDeltaBusinessDays = workingCase.readyPickUpPromise.max.deltaBusinessDays;
    maxTimeOfDay = workingCase.readyPickUpPromise.max.timeOfDay;

    let readyPickUpPromiseMin= getPromise(minType, nowDateTime, minDeltaHours, nextBusinessDays, minDeltaBusinessDays, minTimeOfDay);
    let readyPickUpPromiseMax= getPromise(maxType, nowDateTime, maxDeltaHours, nextBusinessDays, maxDeltaBusinessDays, maxTimeOfDay);

    return ({
        pack_promise_min: packPromiseMin,
        pack_promise_max: packPromiseMax,
        ship_promise_min: shipPromiseMin,
        ship_promise_max: shipPromiseMax,
        delivery_promise_min: deliveryPromiseMin,
        delivery_promise_max: deliveryPromiseMax,
        ready_pickup_promise_min: readyPickUpPromiseMin,
        ready_pickup_promise_max: readyPickUpPromiseMax,
    });
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

orderRouter.route('/promises/:id/:idOrder')
.get(async (req, res) => {
    try {
        const nowDateTime = moment(new Date()).format('YYYY-MM-DD');
        const nextBusinessDays = await getNextBussinessDays();
        const rules = await getRules(parseInt(req.params.id));    // id method

        const dayType = rules.availability.byRequestTime.dayType;
        const fromTimeOfDay = rules.availability.byRequestTime.fromTimeOfDay;
        const toTimeOfDay = rules.availability.byRequestTime.toTimeOfDay;

        const casesList = rules.promisesParameters.cases;

        const validateWeight = getValidateWeight(rules, getWeightTotal(req.params.idOrder)); // weight order
        const validateBusinessDay = getValidateBusinessDay(nextBusinessDays, nowDateTime);
        const validateTimeOfDay = getValidateTimeOfDay(fromTimeOfDay, toTimeOfDay);

        if (!validateWeight) {
            res.send(promiseNull());

            return false;
        }

        switch (dayType) {
            case 'BUSINESS':
                if (!validateBusinessDay) {
                    res.send(promiseNull());

                    return false;
                }
                break;

            case 'NON-BUSINESS':
                console.log('NOT FOR NOW');
                res.send(promiseNull());

                return false;

            case 'WEEKEND':
                console.log('NOT FOR NOW');
                res.send(promiseNull());

                return false;
        
            default:
                break;
        }

        if (!validateTimeOfDay) {
            res.send(promiseNull());

            return false;
        }

        let priority = 0;
        let result = null;

        for (let i = 0; i < casesList.length; i ++) {
            priority ++;
            
            if (casesList[i].priority === priority) {
                result = casesListBucle(casesList[i], validateBusinessDay, nowDateTime, nextBusinessDays);

                if (result) {
                    i = casesList.length;
                }
            }
        }

        if (!result) {
            res.send(promiseNull());
        }
        else {
            res.send(result);
        }
    } 
    catch (error) {
        console.log(error);
    }
});

module.exports = orderRouter;