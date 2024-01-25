import express from 'express';
const router = express.Router();
import {varifyJwt} from '../middlewares/auth.middleware.js';
import {toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos} from '../controllers/like.controller.js';

router.post('/video/:videoId', varifyJwt, toggleVideoLike);
router.post('/comment/:commentId', varifyJwt, toggleCommentLike);
router.post('/tweet/:tweetId', varifyJwt, toggleTweetLike);
router.get('/videos', varifyJwt, getLikedVideos);



export default router;