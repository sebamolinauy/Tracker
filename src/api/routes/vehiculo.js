// Requirements
import express from 'express';
import { session } from '../services/authentication.js';
import { list, remove } from '../controllers/vehiculo.js';


// Initialization
const router = express.Router();


// Routes
router.get('/', session, list);
router.delete('/:codigo', session, remove);


export default router;
