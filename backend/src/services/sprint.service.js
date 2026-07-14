const ApiError = require('../utils/ApiError');
const { SPRINT_STATUS, KANBAN_COLUMNS, ROLES } = require('../config/constants');
const sprintRepository = require('../models/repositories/sprint.repository');
const storyRepository = require('../models/repositories/userStory.repository');
const projectRepository = require('../models/repositories/project.repository');
const { createSprint } = require('../models/entities/sprint.entity');

async function getMembership(projectId, userId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');
  const membership = project.members.find((m) => m.userId === userId);
  if (!membership) throw ApiError.forbidden('No pertenece a este proyecto');
  return membership;
}

async function getSprintOrThrow(sprintId) {
  const sprint = await sprintRepository.findById(sprintId);
  if (!sprint) throw ApiError.notFound('Sprint no encontrado');
  return sprint;
}

async function listSprints(projectId) {
  return sprintRepository.findByProject(projectId);
}

async function createSprintForProject(projectId, { name, startDate, endDate, goal }) {
  if (!name || !startDate || !endDate) {
    throw ApiError.badRequest('Nombre, fecha de inicio y fecha de fin son obligatorios');
  }
  if (new Date(endDate) < new Date(startDate)) {
    throw ApiError.badRequest('La fecha de fin no puede ser anterior a la fecha de inicio');
  }

  return sprintRepository.create(createSprint({ projectId, name, startDate, endDate, goal }));
}

async function closeSprint(sprintId, requesterId) {
  const sprint = await getSprintOrThrow(sprintId);
  const membership = await getMembership(sprint.projectId, requesterId);

  if (![ROLES.SCRUM_MASTER, ROLES.PRODUCT_OWNER].includes(membership.role)) {
    throw ApiError.forbidden('Solo el Scrum Master o el Product Owner pueden cerrar el sprint');
  }

  return sprintRepository.update(sprintId, { status: SPRINT_STATUS.CLOSED });
}

async function addItemToSprint(sprintId, requesterId, storyId) {
  const sprint = await getSprintOrThrow(sprintId);
  await getMembership(sprint.projectId, requesterId);

  const story = await storyRepository.findById(storyId);
  if (!story) throw ApiError.notFound('Historia de usuario no encontrada');
  if (story.projectId !== sprint.projectId) {
    throw ApiError.badRequest('La historia no pertenece al mismo proyecto que el sprint');
  }

  if (sprint.status === SPRINT_STATUS.PLANNED) {
    await sprintRepository.update(sprintId, { status: SPRINT_STATUS.ACTIVE });
  }

  return storyRepository.update(storyId, { sprintId });
}

async function listSprintItems(sprintId) {
  await getSprintOrThrow(sprintId);
  return storyRepository.findBySprint(sprintId);
}

async function getBoard(sprintId) {
  const items = await listSprintItems(sprintId);
  const board = Object.fromEntries(KANBAN_COLUMNS.map((col) => [col, []]));
  items.forEach((item) => {
    board[item.status].push(item);
  });
  return board;
}

async function getProgress(sprintId) {
  const sprint = await getSprintOrThrow(sprintId);
  const items = await storyRepository.findBySprint(sprintId);

  const totalPoints = items.reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const donePoints = items
    .filter((s) => s.status === 'done')
    .reduce((sum, s) => sum + (s.storyPoints || 0), 0);
  const totalItems = items.length;
  const doneItems = items.filter((s) => s.status === 'done').length;

  const percentComplete = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
  const remainingPoints = totalPoints - donePoints;

  return {
    sprintId,
    sprintName: sprint.name,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    totalItems,
    doneItems,
    percentComplete,
    totalPoints,
    donePoints,
    remainingPoints,
  };
}

module.exports = {
  listSprints,
  createSprintForProject,
  closeSprint,
  addItemToSprint,
  listSprintItems,
  getBoard,
  getProgress,
};
