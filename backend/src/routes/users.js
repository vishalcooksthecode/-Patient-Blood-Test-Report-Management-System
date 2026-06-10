const router = require('express').Router();
const { getProfile, updateProfile, uploadAvatar, getAllUsers, createUser, updateUserStatus, resetUserPassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', upload.single('avatar'), uploadAvatar);

router.get('/', authorize('admin'), getAllUsers);
router.post('/', authorize('admin'), createUser);
router.patch('/:id/status', authorize('admin'), updateUserStatus);
router.post('/:id/reset-password', authorize('admin'), resetUserPassword);

module.exports = router;
