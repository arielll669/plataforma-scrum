export const ROLES = {
  PRODUCT_OWNER: 'product_owner',
  SCRUM_MASTER: 'scrum_master',
  DEV_TEAM: 'dev_team',
};

export const ROLE_LABELS = {
  [ROLES.PRODUCT_OWNER]: 'Product Owner',
  [ROLES.SCRUM_MASTER]: 'Scrum Master',
  [ROLES.DEV_TEAM]: 'Equipo de Desarrollo',
};

export const ALL_ROLES = Object.values(ROLES);

export const STORY_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
};

export const KANBAN_COLUMNS = [
  { key: STORY_STATUS.TODO, label: 'Por hacer' },
  { key: STORY_STATUS.IN_PROGRESS, label: 'En progreso' },
  { key: STORY_STATUS.DONE, label: 'Terminado' },
];

export const SPRINT_STATUS_LABELS = {
  planned: 'Planificado',
  active: 'Activo',
  closed: 'Cerrado',
};

export const DEFECT_SEVERITY_LABELS = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};
