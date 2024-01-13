import express from 'express';
const router = express.Router();
import {createTweet, getUserTweets, updateTweet, deleteTweet} from '../controllers/tweet.controller.js';
import {varifyJwt} from '../middlewares/auth.middleware.js';

router.post('/', varifyJwt, createTweet);
router.get('/:userId', varifyJwt, getUserTweets);
router.put('/:tweetId', varifyJwt, updateTweet);
router.delete('/:tweetId', varifyJwt, deleteTweet);


export default router;