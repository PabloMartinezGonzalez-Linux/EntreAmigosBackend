import { Router } from 'express';
import { register, login } from '../controllers/authController.mjs';  

const router = Router();

// Ruta para registrar un usuario
router.post('/register', register);

// Ruta para iniciar sesión
router.post('/login', login);

export default router;
