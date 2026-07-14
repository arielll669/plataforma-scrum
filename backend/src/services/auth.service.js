const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const userRepository = require('../models/repositories/user.repository');
const { createUser, toPublicUser } = require('../models/entities/user.entity');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw ApiError.badRequest('Nombre, correo y contraseña son obligatorios');
  }
  if (password.length < 6) {
    throw ApiError.badRequest('La contraseña debe tener al menos 6 caracteres');
  }

  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw ApiError.conflict('Ya existe una cuenta con ese correo');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create(createUser({ name, email, passwordHash }));

  return { user: toPublicUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw ApiError.badRequest('Correo y contraseña son obligatorios');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw ApiError.unauthorized('Credenciales inválidas');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw ApiError.unauthorized('Credenciales inválidas');
  }

  return { user: toPublicUser(user), token: signToken(user) };
}

module.exports = { register, login };
