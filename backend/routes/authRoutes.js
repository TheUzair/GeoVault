import { Router } from 'express';
import { register, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/protected', protect, (req, res) => {
  res.json({ msg: 'Protected route accessed', user: req.user });
});

export default router;