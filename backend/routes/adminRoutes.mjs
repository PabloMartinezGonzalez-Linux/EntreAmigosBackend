import { Router } from 'express';
import { getAllUsers, deleteUser, setRole } from '../controllers/adminController.mjs'

const adminRoutes = Router();

adminRoutes.get('/getAllUsers' , getAllUsers);
adminRoutes.delete('/deleteUser/:id', deleteUser);
adminRoutes.patch('/setRole/:id', setRole);

export default adminRoutes;
