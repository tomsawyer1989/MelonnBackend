const orderRouter = require('./orderRouter');

module.exports = (app) => {
    app.use('/orders', orderRouter);
};