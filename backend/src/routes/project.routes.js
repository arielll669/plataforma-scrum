const { Router } = require('express');
const projectController = require('../controllers/project.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireProjectRole } = require('../middlewares/roleMiddleware');
const { ROLES } = require('../config/constants');

const storyController = require('../controllers/story.controller');
const sprintController = require('../controllers/sprint.controller');
const defectController = require('../controllers/defect.controller');
const reportController = require('../controllers/report.controller');

const router = Router();

router.use(authMiddleware);

router.post('/', projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:projectId', projectController.getProject);

router.post(
  '/:projectId/members',
  requireProjectRole([ROLES.PRODUCT_OWNER, ROLES.SCRUM_MASTER]),
  projectController.addMember
);
router.put(
  '/:projectId/members/:userId',
  requireProjectRole([ROLES.PRODUCT_OWNER, ROLES.SCRUM_MASTER]),
  projectController.reassignRole
);

// Product Backlog / Historias de usuario (RF-03, RF-04)
router.get('/:projectId/backlog', requireProjectRole(null), storyController.getBacklog);
router.post('/:projectId/stories', requireProjectRole(null), storyController.createStory);
router.put(
  '/:projectId/backlog/reorder',
  requireProjectRole([ROLES.PRODUCT_OWNER]),
  storyController.reorderBacklog
);

// Sprints (RF-05)
router.get('/:projectId/sprints', requireProjectRole(null), sprintController.listSprints);
router.post(
  '/:projectId/sprints',
  requireProjectRole([ROLES.SCRUM_MASTER, ROLES.PRODUCT_OWNER]),
  sprintController.createSprint
);

// Defects (soporte de RF-08.3)
router.get('/:projectId/defects', requireProjectRole(null), defectController.listDefects);
router.post('/:projectId/defects', requireProjectRole(null), defectController.createDefect);

// Reportes (RF-08)
router.get('/:projectId/reports/status', requireProjectRole(null), reportController.getStatusReport);
router.get(
  '/:projectId/reports/team-performance',
  requireProjectRole(null),
  reportController.getTeamPerformanceReport
);
router.get('/:projectId/reports/quality', requireProjectRole(null), reportController.getQualityReport);

module.exports = router;
