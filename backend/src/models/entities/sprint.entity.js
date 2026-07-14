const { SPRINT_STATUS } = require('../../config/constants');

function createSprint({ id, projectId, name, startDate, endDate, goal }) {
  return {
    id,
    projectId,
    name,
    startDate,
    endDate,
    goal: goal || '',
    status: SPRINT_STATUS.PLANNED,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createSprint };
