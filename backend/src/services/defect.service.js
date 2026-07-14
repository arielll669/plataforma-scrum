const ApiError = require('../utils/ApiError');
const defectRepository = require('../models/repositories/defect.repository');
const { createDefect } = require('../models/entities/defect.entity');

async function listDefects(projectId) {
  return defectRepository.findByProject(projectId);
}

async function createDefectForProject(projectId, data) {
  if (!data.title) throw ApiError.badRequest('El título del defecto es obligatorio');
  return defectRepository.create(createDefect({ ...data, projectId }));
}

module.exports = { listDefects, createDefectForProject };
