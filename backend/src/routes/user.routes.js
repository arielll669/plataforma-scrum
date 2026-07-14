const { Router } = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/authMiddleware');

const router = Router();

router.use(authMiddleware);
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);

module.exports = router;
