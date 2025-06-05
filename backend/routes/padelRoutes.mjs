import { Router } from 'express';
import { 
  getEventResult,
  getEventResultById,
  getClassification,
  postEventResult
} from '../controllers/PadelController.mjs';

const padelRoutes = Router();

padelRoutes.get('/getEventsResult', getEventResult);
padelRoutes.get('/getEventsResultById/:id', getEventResultById);
padelRoutes.get('/getClassification', getClassification);
padelRoutes.post('/postEventResult', postEventResult);

export default padelRoutes;
