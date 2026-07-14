const { Router } = require('express');
const sprintController = require('../controllers/sprint.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.put('/:id/close', sprintController.closeSprint);
router.post('/:id/items', sprintController.addItem);
router.get('/:id/items', sprintController.listItems);
router.get('/:id/board', sprintController.getBoard);
router.get('/:id/progress', sprintController.getProgress);

module.exports = router;
