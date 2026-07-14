const ApiError = require('../utils/ApiError');
const { STORY_STATUS } = require('../config/constants');
const storyRepository = require('../models/repositories/userStory.repository');
const projectRepository = require('../models/repositories/project.repository');
const { createUserStory } = require('../models/entities/userStory.entity');

async function assertMember(projectId, userId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');
  if (!project.members.some((m) => m.userId === userId)) {
    throw ApiError.forbidden('No pertenece a este proyecto');
  }
  return project;
}

async function getStoryOrThrow(storyId) {
  const story = await storyRepository.findById(storyId);
  if (!story) throw ApiError.notFound('Historia de usuario no encontrada');
  return story;
}

async function getBacklog(projectId) {
  return storyRepository.findBacklog(projectId);
}

async function createStory(projectId, data) {
  if (!data.title) throw ApiError.badRequest('El título de la historia es obligatorio');

  const maxOrder = await storyRepository.maxPriorityOrder(projectId);
  const story = await storyRepository.create(
    createUserStory({ ...data, projectId, priorityOrder: maxOrder + 1 })
  );
  return story;
}

async function updateStory(storyId, requesterId, changes) {
  const story = await getStoryOrThrow(storyId);
  await assertMember(story.projectId, requesterId);

  const allowed = ['title', 'asA', 'iWant', 'soThat', 'acceptanceCriteria', 'storyPoints', 'assignedTo'];
  const filtered = Object.fromEntries(
    Object.entries(changes).filter(([key]) => allowed.includes(key))
  );

  return storyRepository.update(storyId, filtered);
}

async function deleteStory(storyId, requesterId) {
  const story = await getStoryOrThrow(storyId);
  await assertMember(story.projectId, requesterId);
  await storyRepository.remove(storyId);
  return { id: storyId };
}

async function reorderBacklog(projectId, orderedIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    throw ApiError.badRequest('Se requiere la lista ordenada de IDs de historias');
  }

  await Promise.all(
    orderedIds.map((id, index) => storyRepository.update(id, { priorityOrder: index + 1 }))
  );

  return storyRepository.findBacklog(projectId);
}

async function updateStatus(storyId, requesterId, status) {
  if (!Object.values(STORY_STATUS).includes(status)) {
    throw ApiError.badRequest('Estado de historia inválido');
  }

  const story = await getStoryOrThrow(storyId);
  await assertMember(story.projectId, requesterId);

  if (!story.sprintId) {
    throw ApiError.badRequest('Solo las historias dentro de un sprint pueden cambiar de estado en el tablero');
  }

  return storyRepository.update(storyId, { status });
}

module.exports = {
  getBacklog,
  createStory,
  updateStory,
  deleteStory,
  reorderBacklog,
  updateStatus,
  assertMember,
  getStoryOrThrow,
};
