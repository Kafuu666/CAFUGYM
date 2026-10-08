const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
const verifyToken = (token) => jwt.verify(token, env.jwt.secret);

module.exports = { signToken, verifyToken };
