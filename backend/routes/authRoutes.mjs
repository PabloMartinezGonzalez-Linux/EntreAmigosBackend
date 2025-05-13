import { Router } from 'express';
import { register, login, checkStatus } from '../controllers/authController.mjs';  
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Ruta para registrar un usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

router.get('/check-status', verifyToken ,checkStatus);

export default router;
