const jwt = require('jsonwebtoken');
const secret = require('../configs/environnement/config').jwt_secret;


const validJWTOptional = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      const authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return next();
      } else {
        req.jwt = jwt.verify(authorization[1], secret);
          return next();
      }
    } catch (err) {
        console.log(err.message);
      return next();
    }
  } else {
    return next();
  }
};



const validJWTNeeded = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      const authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        const message = 'REQUIRED VALID TOKEN';
        return res.status(401).json({
            'message': message
        });
      } else {
        req.jwt = jwt.verify(authorization[1], secret);
          return next();
      }
    } catch (err) {
      const message = 'FORBIDDEN ! THERE IS AN ERROR IN TOKEN';
      return res.status(401).json({
        'message': message,
        'error': err.message
      });
    }
  } else {
    const message = 'REQUIRED VALID TOKEN';
    return res.status(401).json({
        'message': message
    });
  }
};


module.exports = {
  validJWTOptional:validJWTOptional,
  validJWTNeeded: validJWTNeeded
};
