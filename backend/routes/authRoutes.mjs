import { Router } from 'express';
import { register, login, checkStatus } from '../controllers/authController.mjs';  
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-status', verifyToken ,checkStatus);

export default router;
