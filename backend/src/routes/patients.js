const router = require('express').Router();
const { createPatient, getPatients, getPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('admin', 'lab_staff'), getPatients);
router.post('/', authorize('admin'), createPatient);
router.get('/:id', authorize('admin', 'lab_staff'), getPatient);
router.put('/:id', authorize('admin'), updatePatient);
router.delete('/:id', authorize('admin'), deletePatient);

module.exports = router;
