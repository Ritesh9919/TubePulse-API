import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from '../models/video.model.js';
import {Comment} from '../models/comment.model.js';
import {Tweet} from '../models/tweet.model.js';
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    // 1. find video
    //2 . check if like exist
    //3. if exist then delete like
    //4. if not exist then add like

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video id');
    }

    const video = await Video.findById(videoId);
    if(!video) {
        throw new ApiError(404, 'Video does not exist');
    }

    let deleted = false;

    const isLikeExist = await Like.findOne({likedBy:req.user._id, video:videoId});
    if(isLikeExist) {
        await isLikeExist.deleteOne()
        deleted = true;
    }else {
        await Like.create({
            likedBy:req.user._id,
            video:videoId
        })
        deleted = false;
    }

    return res.status(201)
    .json(new ApiResponse(200, {deleted}, deleted ? 'Disliked':'Liked'));


    
})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment id');
    }

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, 'Comment does not exist');
    }

    let deleted = false;

    const isLikeExist = await Like.findOne({likedBy:req.user._id, comment:commentId});
    if(isLikeExist) {
        await isLikeExist.deleteOne();
        deleted = true;
    }else {
        await Like.create({
            likedBy:req.user._id,
            comment:commentId
        })
        deleted = false;
    }
    
    return res.status(201)
    .json(new ApiResponse(200, {deleted}, deleted ? 'Disliked':'Liked'));

})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet id');
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new ApiError(404, 'Tweet does not exist');
    }

    let deleted = false;

    const isLikeExist = await Like.findOne({likedBy:req.user._id, tweet:tweetId});
    if(isLikeExist) {
        await isLikeExist.deleteOne();
        deleted = true;
    }else {
        await Like.create({
            likedBy:req.user._id,
            tweet:tweetId
        })

        deleted = false;
    }

    return res.status(201)
    .json(new ApiResponse(200, {deleted}, deleted ? 'Disliked':'Liked'));
   
    
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.find({likedBy:req.user._id, video:{$exists:true}})
    .populate({
        path:'video',
        select:'videoFile title description'
    })

    return res.status(200)
    .json(new ApiResponse(200, likedVideos, 'Fetched liked videos'));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}