import { Router } from 'express';
import { authenticateUri } from '../uriConfig';
import { sendStatus405 } from '../../middleware/statusCodes';
import { authenticate } from '../routes/auth/authenticate';

const router: Router = Router();

router.get(authenticateUri, sendStatus405('POST'));
router.put(authenticateUri, sendStatus405('POST'));
router.delete(authenticateUri, sendStatus405('POST'));
router.post(authenticateUri, authenticate);

export default router;
