import mongoose, {isValidObjectId} from 'mongoose';
import {Tweet} from '../models/tweet.model.js';
import {User} from '../models/user.model.js';
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';



const createTweet = asyncHandler(async(req, res)=> {
     const {content} = req.body;
     
     if(!content) {
        throw new ApiError(400, 'Content is required');
     }

     const tweet = await Tweet.create({
        content,
        owner:req.user._id
     })

     return res.status(201)
     .json(new ApiResponse(200, tweet, 'Tweet created successfully'));
})


const getUserTweets = asyncHandler(async(req, res)=> {
   const {userId} = req.params;

   if(!isValidObjectId(userId)) {
    throw new ApiError(400, 'userId is invalid');
   }
    
   const user = await User.findById(userId);
   if(!user) {
      throw new ApiError(404, 'User does not exist');
   }

   const tweets = await Tweet.find({owner:userId});
   if(!tweets) {
      throw new ApiError(404, 'Tweets does not exist');
   }

   return res.status(200)
   .json(new ApiResponse(200, tweets, 'Tweets fetched successfully'));
})


const updateTweet = asyncHandler(async(req, res)=> {
   const {tweetId} = req.params;
   const {content} = req.body;

   if(!isValidObjectId(tweetId)) {
      throw new ApiError(400, 'tweetId is invalid');
   }

   if(!content) {
      throw new ApiError(400, 'Content is required');
   }

   const tweet = await Tweet.findById(tweetId);
   if(!tweet) {
      throw new ApiError(404, 'Tweet does not exist');
   }

   if(!tweet.owner.equals(req.user._id)) {
      throw new ApiError(401, "This is someone else tweet you can't update");
   }

   const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {$set:{content}},
      {new:true}
   )

   return res.status(200)
   .json(new ApiResponse(200, updatedTweet, 'Tweet updated successfully'));
})


const deleteTweet = asyncHandler(async(req, res)=> {
    const {tweetId} = req.params;

    if(!isValidObjectId(tweetId)) {
      throw new ApiError(400, 'tweetId is invalid');
   }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
      throw new ApiError(404, 'Tweet does not exist');
    }

    if(!tweet.owner.equals(req.user._id)) {
      throw new ApiError(401, "This is someone else tweet you can't delete");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(
      tweetId,
      {new:true}
    )

    return res.status(200)
    .json(new ApiResponse(200, deletedTweet, 'Tweet deleted successfully'));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}


