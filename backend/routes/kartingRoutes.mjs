import { Router } from 'express';
import { 
  registerUserForNextEvent, 
  getUsersForNextEvent, 
  getEventResultsByEventId, 
  actualizarClasificacionKarting, 
  getKartingClassification,
  getEventList,
  updateSingleEventResult,
  upsertEvent,
  cancelRegisterUserForNextEvent
} from '../controllers/kartingController.mjs';

const router = Router();

router.post('/registerUserForNextEvent', registerUserForNextEvent);
router.delete('/cancelRegisterUserForNextEvent/:user_id',cancelRegisterUserForNextEvent);
router.get('/getUserForNextEvent', getUsersForNextEvent);
router.get('/getEventsList', getEventList);
router.get('/getEventResults/:eventId', getEventResultsByEventId);
router.post('/actualizar-clasificacion', actualizarClasificacionKarting);
router.get('/karting-classification', getKartingClassification);
router.put('/updateEventResults', updateSingleEventResult);
router.post('/upsertEvent', upsertEvent);

export default router;
