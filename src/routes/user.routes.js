import express from 'express';
const router = express.Router();
import { registerUser, loginUser, logoutUser, refreshAccessToken } from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {varifyJwt} from '../middlewares/auth.middleware.js';

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
router.get('/logout', varifyJwt, logoutUser);
router.post('/refresh-token', refreshAccessToken);


export default router;