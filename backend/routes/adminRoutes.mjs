import { Router } from 'express';
import { getAllUsers } from '../controllers/adminController.mjs'

const adminRoutes = Router();

adminRoutes.get('/getAllUsers' , getAllUsers);

export default adminRoutes;
