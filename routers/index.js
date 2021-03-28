const sessionRouter = require('./sessionRouter');
const orderRouter = require('./orderRouter');

module.exports = (app) => {
    app.use('/sessions', sessionRouter);
    app.use('/orders', orderRouter);
};