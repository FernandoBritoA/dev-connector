const jwt = require('jsonwebtoken');
const config = require('config');

//middleware function:
//fn that has access to the req/res cycle
//next is a callback to move to the next piece of middleware
module.exports = function (req, res, next) {
  //Get token from header
  const token = req.header('x-auth-token');
  //key = 'x-auth-token'
  //value = token

  //Check if no token (need to sign in to access certain functions)
  if (!token) {
    return res.status(401).json({
      msg: 'No token, authorization denied',
    });
  }

  //Verify token
  try {
    //decode token
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    // @ts-ignore
    req.user = decoded.user;
    //get id of the user encrypted in the token

    next();
  } catch (err) {
    res.status(401).json({
      msg: 'Token is not valid',
    });
  }
};
