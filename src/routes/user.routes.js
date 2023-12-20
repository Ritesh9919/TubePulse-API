import express from 'express';
const router = express.Router();
import { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
 } from '../controllers/user.controller.js';


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
router.post('/change-password', varifyJwt, changePassword );
router.get('/current-user', varifyJwt, getCurrentUser);
router.put('/update-account-details', varifyJwt, updateAccountDetails);
router.put('/update-avatar', varifyJwt, upload.single('avatar'), updateUserAvatar);
router.put('/update-cover-image', varifyJwt, upload.single('coverImage'), updateUserCoverImage);


export default router;