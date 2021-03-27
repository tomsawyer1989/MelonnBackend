const baseUrlShipping = 'https://yhua9e1l30.execute-api.us-east-1.amazonaws.com/sandbox/';

exports.methodsListEndpoint = (params) => `${baseUrlShipping}shipping-methods/${params ? params : ''}`;

exports.offDaysListEndpoint = (params) => `${baseUrlShipping}off-days/${params ? params : ''}`;