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
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
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
router.patch('/update-account', varifyJwt, updateAccountDetails);
router.patch('/avatar', varifyJwt, upload.single('avatar'), updateUserAvatar);
router.patch('/cover-image', varifyJwt, upload.single('coverImage'), updateUserCoverImage);
router.get('/c/:username', varifyJwt, getUserChannelProfile);
router.get('/history', varifyJwt, getWatchHistory);



export default router;