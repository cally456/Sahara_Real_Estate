import express from 'express';
import { generateOwnerReport} from '../controllers/reports.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/owner', verifyToken, generateOwnerReport);


export default router;
