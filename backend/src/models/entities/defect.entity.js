const { DEFECT_SEVERITY, DEFECT_STATUS } = require('../../config/constants');

function createDefect({ id, projectId, sprintId, title, description, severity }) {
  return {
    id,
    projectId,
    sprintId: sprintId || null,
    title,
    description: description || '',
    severity: severity && Object.values(DEFECT_SEVERITY).includes(severity)
      ? severity
      : DEFECT_SEVERITY.MEDIUM,
    status: DEFECT_STATUS.OPEN,
    reportedAt: new Date().toISOString(),
  };
}

module.exports = { createDefect };
