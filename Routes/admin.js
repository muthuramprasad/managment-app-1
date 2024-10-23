import express from 'express';
// import { signup, signIn } from '../Controllers/admin.js'; 
import {signup, signin, authBearer  } from '../Controllers/admin.js'; 
import multiparty from 'connect-multiparty';




const router = express.Router();
// const multipartyMiddleware = multiparty();

// No authBearer middleware for signup and signin routes
router.post('/signup', signup);
router.post('/signin', signin);

// Use authBearer for routes that need authentication
// Example: router.get('/protected-route', authBearer, someControllerFunction);

export default router;
