const express = require('express');
const bodyParser = require('body-parser');

const orderRouter = express.Router();

orderRouter.use(bodyParser.json());

orderRouter.route('/')
.get(async (req,res) => {
    // try {
    //     const {rows} = await pool.query('SELECT * FROM order');
    //     res.send(rows);
    // } 
    // catch (error) {
    //     console.log(error);
    // }
});

module.exports = orderRouter;