import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subcription} from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channel id');
    }

    const subscription = await Subcription.findOne({channel:channelId, subscriber:req.user._id});

    let subscribed = true;

    if(subscription) {
        await subscription.deleteOne();
        subscribed = false;
    }else{
        await Subcription.create({channel:channelId, subscriber:req.user._id});
        subscribed = true;
    }

    return res.status(201)
    .json(new ApiResponse(200, {subscribed}, subscribed ? 'Subscribed':'Unsubscribed'));
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subcription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
           $lookup:{
            from:'users',
            localField:'subscriber',
            foreignField:'_id',
            as:'channelSubscribers',
            pipeline:[
                {
                    $project:{
                        username:1,
                        email:1,
                        avatar:1
                    }
                }
            ]
           } 
        },
        {
            $addFields:{
                subscribers:{
                    $first:'$channelSubscribers'
                }
            }
        },
        {
            $project:{
                subscribers:1
            }
        }
    ])

    if(subscribers.length == 0) {
        throw new ApiError(404, 'Subscribers does not exist');
    }

    return res.status(200)
    .json(new ApiResponse(200, subscribers, 'Subscribers fetched successfully'));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if(!isValidObjectId(subscriberId)) {
        throw new ApiError(400, 'Invalid subscriber id');
    }

    const channels = await Subcription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
           $lookup:{
            from:'users',
            localField:'channel',
            foreignField:'_id',
            as:'channels',
            pipeline:[
                {
                    $project:{
                        username:1,
                        avatar:1,
                        email:1
                    }
                }
            ]
           } 
        },
        {
            $addFields:{
             channels:{
                $first:'$channels'
             }
            }
        },
        {
            $project:{
                channels:1
            }
        }
    ])

    if(channels.length == 0) {
        throw new ApiError(404, 'Channels does not exist');
    }

    return res.status(200)
    .json(new ApiResponse(200, channels, 'Channel fetched successfully'));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}