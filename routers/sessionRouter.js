const express = require('express');
const bodyParser = require('body-parser');

const sessionRouter = express.Router();
sessionRouter.use(bodyParser.json());

const sessions = [
    {
        name: 'Jorge Leonardo Herrera',
        username: 'admin',
        password: 'admin',
    }
];

sessionRouter.route('/')
.get(async (req, res) => {
    try {
        res.send(sessions);
    } 
    catch (error) {
        console.log(error);
    }
});

module.exports = sessionRouter;