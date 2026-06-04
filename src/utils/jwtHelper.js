const jwt = require('jsonwebtoken');

const signToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const signRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh');
  return jwt.verify(token, secret);
};

module.exports = {
  signToken,
  verifyToken,
  signRefreshToken,
  verifyRefreshToken
};
