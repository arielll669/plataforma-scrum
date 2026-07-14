const { STORY_STATUS } = require('../../config/constants');

function createUserStory({
  id,
  projectId,
  title,
  asA,
  iWant,
  soThat,
  acceptanceCriteria,
  storyPoints,
  priorityOrder,
  assignedTo,
}) {
  return {
    id,
    projectId,
    sprintId: null,
    title,
    asA: asA || '',
    iWant: iWant || '',
    soThat: soThat || '',
    acceptanceCriteria: Array.isArray(acceptanceCriteria) ? acceptanceCriteria : [],
    storyPoints: Number.isFinite(storyPoints) ? storyPoints : null,
    priorityOrder,
    assignedTo: assignedTo || null,
    status: STORY_STATUS.TODO,
    createdAt: new Date().toISOString(),
  };
}

module.exports = { createUserStory };
