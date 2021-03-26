export const baseUrlShipping = 'https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox/';

export const methodsListEndpoint = (params) => `${baseUrlShipping}shipping-methods/${params ? params : ''}`;

export const offDaysListEndpoint = (params) => `${baseUrlShipping}off-days/${params ? params : ''}`;