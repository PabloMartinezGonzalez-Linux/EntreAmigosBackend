import { Router } from 'express';
import { registerUserForNextEvent, getUsersForNextEvent, getEventResultsByEventId, actualizarClasificacionKarting, getKartingClassification} from '../controllers/kartingController.mjs';

const router = Router();

router.post('/registerUserForNextEvent', registerUserForNextEvent);
router.get('/getUserForNextEvent', getUsersForNextEvent);
router.get('/getEventResults/:eventId', getEventResultsByEventId);
router.post('/karting/actualizar-clasificacion', actualizarClasificacionKarting);
router.get('/karting-classification', getKartingClassification);

export default router;
