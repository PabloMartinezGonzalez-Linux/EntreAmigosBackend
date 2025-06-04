import { Router } from 'express';
import { 
  getEventResult,
  getEventResultById
} from '../controllers/PadelController.mjs';

const padelRoutes = Router();

padelRoutes.get('/getEventsResult', getEventResult);
padelRoutes.get('/getEventsResultById/:id', getEventResultById);

export default padelRoutes;
