const router = require('express').Router();
const { uploadReport, getReports, getReport, downloadReport, updateReportStatus, deleteReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
router.get('/', getReports);
router.post('/', authorize('admin', 'lab_staff'), upload.single('file'), uploadReport);
router.get('/:id', getReport);
router.get('/:id/download', downloadReport);
router.patch('/:id/status', authorize('admin', 'lab_staff'), updateReportStatus);
router.delete('/:id', authorize('admin'), deleteReport);

module.exports = router;
