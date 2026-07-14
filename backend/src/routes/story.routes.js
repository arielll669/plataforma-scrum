const { Router } = require('express');
const storyController = require('../controllers/story.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);

router.put('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);
router.put('/:id/status', storyController.updateStatus);

module.exports = router;
