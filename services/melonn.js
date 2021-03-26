import { methodsListEndpoint, offDaysListEndpoint } from './config/endpoints';
import { optionsGET } from './config/options';

export const getMethodsList = async () => {
    try {
      const response = await fetch(methodsListEndpoint(), optionsGET());
  
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

export const getMethodDetails = async (params) => {
    try {
      const response = await fetch(methodsListEndpoint(params), optionsGET());
  
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

export const getOffDaysList = async () => {
    try {
      const response = await fetch(offDaysListEndpoint(), optionsGET());
  
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