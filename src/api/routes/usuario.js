// Requirements
import express from 'express';
import { session } from '../services/authentication.js';
import { get } from '../controllers/usuario.js';


// Initialization
const router = express.Router();


// Routes
router.get('/', session, get);


export default router;
