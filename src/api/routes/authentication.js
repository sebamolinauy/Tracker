// Requirements
import express from 'express';
import { login, logout } from '../controllers/authentication.js';


// Initialization
const router = express.Router();


// Routes
router.post('/login', login);
router.get('/logout', logout);


export default router;
