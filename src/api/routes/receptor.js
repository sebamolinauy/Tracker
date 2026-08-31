// Requirements
import express from 'express';
import { posicion } from '../controllers/receptor.js';
import { receptorAuth } from '../services/receptorAuth.js';


// Initialization
const router = express.Router();


// Routes
router.post('/posicion', receptorAuth, posicion);


export default router;
