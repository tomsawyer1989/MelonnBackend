const endpoints = require('./config/endpoints');
const options = require('./config/options');
const fetch = require('node-fetch');

exports.getMethodsList = async () => {
    try {
      const response = await fetch(endpoints.methodsListEndpoint(), options.optionsGET());
  
      if (!response.ok) {
        return {
          success: false,
          message: 'unauthorized',
        };
      }
  
      const methods = await response.json();
  
      return {
        success: true,
        message: 'OK',
        methods,
      };
    } catch (err) {
      console.log(`Unable to get the information to the database: ${err}`);
      throw err
    }
}

exports.getMethodDetails = async (params) => {
    try {
      const response = await fetch(endpoints.methodsListEndpoint(params), options.optionsGET());
  
      if (!response.ok) {
        return {
          success: false,
          message: 'unauthorized',
        };
      }
  
      const method = await response.json();
  
      return {
        success: true,
        message: 'OK',
        method,
      };
    } catch (err) {
      console.log(`Unable to get the information to the database: ${err}`);
      throw err
    }
}

exports.getOffDaysList = async () => {
    try {
      const response = await fetch(endpoints.offDaysListEndpoint(), options.optionsGET());
  
      if (!response.ok) {
        return {
          success: false,
          message: 'unauthorized',
        };
      }
  
      const offDays = await response.json();
  
      return {
        success: true,
        message: 'OK',
        offDays,
      };
    } catch (err) {
      console.log(`Unable to get the information to the database: ${err}`);
      throw err
    }
}