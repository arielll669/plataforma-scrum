const ApiError = require('../utils/ApiError');
const projectRepository = require('../models/repositories/project.repository');

/**
 * Restringe el acceso según el rol Scrum del usuario autenticado dentro
 * del proyecto indicado por `req.params[projectIdParam]` (RF-02.2).
 * Adjunta `req.membership` con la membresía encontrada para uso posterior.
 */
function requireProjectRole(allowedRoles, projectIdParam = 'projectId') {
  return async function roleMiddleware(req, res, next) {
    try {
      const projectId = req.params[projectIdParam];
      const project = await projectRepository.findById(projectId);

      if (!project) {
        throw ApiError.notFound('Proyecto no encontrado');
      }

      const membership = project.members.find((m) => m.userId === req.user.id);

      if (!membership) {
        throw ApiError.forbidden('No pertenece a este proyecto');
      }

      if (Array.isArray(allowedRoles) && !allowedRoles.includes(membership.role)) {
        throw ApiError.forbidden('Su rol no tiene permiso para esta acción');
      }

      req.project = project;
      req.membership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
}

/**
 * Verifica solamente que el usuario pertenezca al proyecto, sin
 * restringir por rol. Adjunta `req.project` y `req.membership`.
 */
function requireProjectMember(projectIdParam = 'projectId') {
  return requireProjectRole(null, projectIdParam);
}

module.exports = { requireProjectRole, requireProjectMember };
