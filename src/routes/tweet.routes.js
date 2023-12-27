import express from 'express';
const router = express.Router();
import {createTweet, getAllTweets, getTweet, getAllTweetsByUser, updateTweet, deleteTweet} from '../controllers/tweet.controller.js';
import {varifyJwt} from '../middlewares/auth.middleware.js';

router.post('/', varifyJwt, createTweet);
router.get('/', varifyJwt, getAllTweets);
router.get('/by-user', varifyJwt, getAllTweetsByUser);
router.get('/:tweetId', varifyJwt, getTweet);
router.put('/:tweetId', varifyJwt, updateTweet);
router.delete('/:tweetId', varifyJwt, deleteTweet);

export default router;