import express from 'express';
const router = express.Router();
import {varifyJwt} from '../middlewares/auth.middleware.js';
import {toggleSubscription, getSubscribedChannels, getUserChannelSubscribers} from '../controllers/subscription.controller.js';

router.post('/:channelId', varifyJwt, toggleSubscription);
router.get('/subscribers/:channelId', varifyJwt, getUserChannelSubscribers);
router.get('/channels/:subscriberId', varifyJwt, getSubscribedChannels);


export default router;