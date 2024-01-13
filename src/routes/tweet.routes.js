import express from 'express';
const router = express.Router();
import {createTweet, getUserTweets} from '../controllers/tweet.controller.js';
import {varifyJwt} from '../middlewares/auth.middleware.js';

router.post('/', varifyJwt, createTweet);
router.get('/:userId', varifyJwt, getUserTweets);

export default router;