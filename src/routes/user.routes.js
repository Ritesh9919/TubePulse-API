import express from 'express';
const router = express.Router();
import { registerUser, loginUser } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';

router.post('/register', upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]), registerUser);

router.post('/login', loginUser);


export default router;