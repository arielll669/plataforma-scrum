const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const userRepository = require('../models/repositories/user.repository');
const { toPublicUser } = require('../models/entities/user.entity');

async function getById(id) {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('Usuario no encontrado');
  return toPublicUser(user);
}

async function updateProfile(id, requesterId, { name, email, password }) {
  if (id !== requesterId) {
    throw ApiError.forbidden('Solo puede editar su propio perfil');
  }

  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('Usuario no encontrado');

  const changes = {};
  if (name) changes.name = name;
  if (email && email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw ApiError.conflict('Ya existe una cuenta con ese correo');
    changes.email = email;
  }
  if (password) {
    if (password.length < 6) {
      throw ApiError.badRequest('La contraseña debe tener al menos 6 caracteres');
    }
    changes.passwordHash = await bcrypt.hash(password, 10);
  }

  const updated = await userRepository.update(id, changes);
  return toPublicUser(updated);
}

module.exports = { getById, updateProfile };
