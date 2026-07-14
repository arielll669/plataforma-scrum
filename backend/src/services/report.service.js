const ApiError = require('../utils/ApiError');
const { SPRINT_STATUS, STORY_STATUS, DEFECT_STATUS } = require('../config/constants');
const projectRepository = require('../models/repositories/project.repository');
const storyRepository = require('../models/repositories/userStory.repository');
const sprintRepository = require('../models/repositories/sprint.repository');
const defectRepository = require('../models/repositories/defect.repository');
const userRepository = require('../models/repositories/user.repository');

async function getProjectOrThrow(projectId) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound('Proyecto no encontrado');
  return project;
}

async function getStatusReport(projectId) {
  await getProjectOrThrow(projectId);

  const stories = await storyRepository.findByProject(projectId);
  const sprints = await sprintRepository.findByProject(projectId);
  const activeSprint = sprints.find((s) => s.status === SPRINT_STATUS.ACTIVE) || null;

  const backlogCount = stories.filter((s) => !s.sprintId).length;
  const doneCount = stories.filter((s) => s.status === STORY_STATUS.DONE).length;

  let activeSprintProgress = null;
  if (activeSprint) {
    const items = stories.filter((s) => s.sprintId === activeSprint.id);
    const done = items.filter((s) => s.status === STORY_STATUS.DONE).length;
    activeSprintProgress = {
      sprintId: activeSprint.id,
      sprintName: activeSprint.name,
      totalItems: items.length,
      doneItems: done,
      percentComplete: items.length === 0 ? 0 : Math.round((done / items.length) * 100),
    };
  }

  return {
    totalStories: stories.length,
    backlogCount,
    doneCount,
    totalSprints: sprints.length,
    closedSprints: sprints.filter((s) => s.status === SPRINT_STATUS.CLOSED).length,
    activeSprint: activeSprintProgress,
  };
}

async function getTeamPerformanceReport(projectId) {
  const project = await getProjectOrThrow(projectId);
  const stories = await storyRepository.findByProject(projectId);

  const performance = await Promise.all(
    project.members.map(async (member) => {
      const user = await userRepository.findById(member.userId);
      const assigned = stories.filter((s) => s.assignedTo === member.userId);
      const completed = assigned.filter((s) => s.status === STORY_STATUS.DONE);
      const pointsCompleted = completed.reduce((sum, s) => sum + (s.storyPoints || 0), 0);

      return {
        userId: member.userId,
        name: user ? user.name : 'Usuario desconocido',
        role: member.role,
        assignedCount: assigned.length,
        completedCount: completed.length,
        pointsCompleted,
      };
    })
  );

  return performance;
}

async function getQualityReport(projectId) {
  await getProjectOrThrow(projectId);

  const stories = await storyRepository.findByProject(projectId);
  const defects = await defectRepository.findByProject(projectId);

  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === STORY_STATUS.DONE).length;
  const completionRate = totalStories === 0 ? 0 : Math.round((doneStories / totalStories) * 100);

  const defectsBySeverity = defects.reduce((acc, d) => {
    acc[d.severity] = (acc[d.severity] || 0) + 1;
    return acc;
  }, {});

  return {
    totalStories,
    doneStories,
    completionRate,
    totalDefects: defects.length,
    openDefects: defects.filter((d) => d.status !== DEFECT_STATUS.RESOLVED).length,
    defectsBySeverity,
  };
}

module.exports = { getStatusReport, getTeamPerformanceReport, getQualityReport };
