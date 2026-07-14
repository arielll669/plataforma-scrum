const ROLES = Object.freeze({
  PRODUCT_OWNER: 'product_owner',
  SCRUM_MASTER: 'scrum_master',
  DEV_TEAM: 'dev_team',
});

const ALL_ROLES = Object.values(ROLES);

const STORY_STATUS = Object.freeze({
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
});

const KANBAN_COLUMNS = [STORY_STATUS.TODO, STORY_STATUS.IN_PROGRESS, STORY_STATUS.DONE];

const SPRINT_STATUS = Object.freeze({
  PLANNED: 'planned',
  ACTIVE: 'active',
  CLOSED: 'closed',
});

const DEFECT_SEVERITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
});

const DEFECT_STATUS = Object.freeze({
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
});

module.exports = {
  ROLES,
  ALL_ROLES,
  STORY_STATUS,
  KANBAN_COLUMNS,
  SPRINT_STATUS,
  DEFECT_SEVERITY,
  DEFECT_STATUS,
};
