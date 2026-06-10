const router = require('express').Router();
const { getDashboardStats, getMonthlyStats, getTopTests, getRecentActivity } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/monthly', getMonthlyStats);
router.get('/top-tests', getTopTests);
router.get('/activity', getRecentActivity);

module.exports = router;
