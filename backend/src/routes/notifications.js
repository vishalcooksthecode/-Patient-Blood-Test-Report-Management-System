const router = require('express').Router();
const { getNotifications, markRead, markOneRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getNotifications);
router.put('/read-all', markRead);
router.put('/:id/read', markOneRead);

module.exports = router;
