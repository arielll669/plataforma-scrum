const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const userRepository = require('../models/repositories/user.repository');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Falta el token de autenticación');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw ApiError.unauthorized('Usuario no válido');
    }

    req.user = { id: user.id, name: user.name, email: user.email };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Token inválido o expirado'));
  }
}

module.exports = authMiddleware;
