// logger.js

const logMiddleware = (req, res, next) => {
    const { method, url, body, query, params, headers } = req;
  
    console.log(`[${new Date().toISOString()}] ${method} ${url}`);
    console.log('Request Body:', body);
    console.log('Query Parameters:', query);
    console.log('URL Parameters:', params);
    console.log('Headers:', headers);
  
    next();
  };
  
  module.exports = logMiddleware;
  