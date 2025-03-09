import { Router } from 'express';
import { authenticateUri, logoutUri } from '../uriConfig';
import { sendStatus405 } from '../../middleware/statusCodes';
import { authenticate, logout } from '../routes/auth/authenticate';

const router: Router = Router();

router.get(authenticateUri, sendStatus405('POST'));
router.put(authenticateUri, sendStatus405('POST'));
router.delete(authenticateUri, sendStatus405('POST'));
router.post(authenticateUri, authenticate);

router.get(logoutUri, logout);
router.put(logoutUri, sendStatus405('GET'));
router.delete(logoutUri, sendStatus405('GET'));
router.post(logoutUri, sendStatus405('GET'));

export default router;
