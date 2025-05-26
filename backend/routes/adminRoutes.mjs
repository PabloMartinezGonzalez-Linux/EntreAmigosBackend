import { Router } from 'express';
import { getAllUsers, deleteUser } from '../controllers/adminController.mjs'

const adminRoutes = Router();

adminRoutes.get('/getAllUsers' , getAllUsers);
adminRoutes.delete('/deleteUser/:id', deleteUser);

export default adminRoutes;
