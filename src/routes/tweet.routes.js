import express from 'express';
const router = express.Router();
import {createTweet} from '../controllers/tweet.controller.js';
import {varifyJwt} from '../middlewares/auth.middleware.js';

router.post('/', varifyJwt, createTweet);

export default router;