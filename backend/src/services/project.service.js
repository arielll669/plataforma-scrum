const ApiError = require('../utils/ApiError');
const { ALL_ROLES } = require('../config/constants');
const projectRepository = require('../models/repositories/project.repository');
const userRepository = require('../models/repositories/user.repository');
const { createProject } = require('../models/entities/project.entity');
const { toPublicUser } = require('../models/entities/user.entity');

async function enrichMembers(project) {
  const members = await Promise.all(
    project.members.map(async (m) => {
      const user = await userRepository.findById(m.userId);
      return { userId: m.userId, role: m.role, user: toPublicUser(user) };
    })
  );
  return { ...project, members };
}

async function createNewProject({ name, description }, ownerId) {
  if (!name) throw ApiError.badRequest('El nombre del proyecto es obligatorio');
  const project = await projectRepository.create(createProject({ name, description, ownerId }));
  return enrichMembers(project);
}

async function listForUser(userId) {
  const projects = await projectRepository.findAllForUser(userId);
  return Promise.all(projects.map(enrichMembers));
}

async function getByIdForUser(projectId, userId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');
  if (!project.members.some((m) => m.userId === userId)) {
    throw ApiError.forbidden('No pertenece a este proyecto');
  }
  return enrichMembers(project);
}

async function addMember(projectId, { email, role }) {
  if (!email || !role) throw ApiError.badRequest('El correo y el rol son obligatorios');
  if (!ALL_ROLES.includes(role)) throw ApiError.badRequest('Rol Scrum inválido');

  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');

  const user = await userRepository.findByEmail(email);
  if (!user) throw ApiError.notFound('No existe un usuario registrado con ese correo');

  if (project.members.some((m) => m.userId === user.id)) {
    throw ApiError.conflict('El usuario ya es miembro del proyecto');
  }

  const members = [...project.members, { userId: user.id, role }];
  const updated = await projectRepository.update(projectId, { members });
  return enrichMembers(updated);
}

async function reassignRole(projectId, targetUserId, { role }) {
  if (!ALL_ROLES.includes(role)) throw ApiError.badRequest('Rol Scrum inválido');

  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');

  const exists = project.members.some((m) => m.userId === targetUserId);
  if (!exists) throw ApiError.notFound('El usuario no es miembro del proyecto');

  const members = project.members.map((m) => (m.userId === targetUserId ? { ...m, role } : m));
  const updated = await projectRepository.update(projectId, { members });
  return enrichMembers(updated);
}

module.exports = { createNewProject, listForUser, getByIdForUser, addMember, reassignRole, enrichMembers };
