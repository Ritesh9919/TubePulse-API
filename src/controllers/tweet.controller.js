import { Tweet } from "../models/tweet.model.js";
import {ApiError} from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { User } from "../models/user.model.js";




const createTweet = asyncHandler(async(req, res)=> {
    const {content} = req.body;
    if(!content) {
        throw new ApiError(400, 'content is required');
    }

    const tweet = await Tweet.create({content, owner:req.user._id});
    return res.status(201)
    .json(new ApiResponse(200, tweet, 'Tweet created successfully'));
})


const getAllTweets = asyncHandler(async(req, res)=> {
     const tweets = await Tweet.find();
     if(!tweets) {
        throw new ApiError(404, 'Tweets does not exist');
     }

     return res.status(200)
     .json(new ApiResponse(200, tweets, 'Tweets fetched successfully'));
})

const getAllTweetsByUser = asyncHandler(async(req, res)=> {
    const userId = req.user._id;
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


const getTweet = asyncHandler(async(req, res)=> {
    const {tweetId} = req.params;
    if(!tweetId) {
        throw new ApiError(400, 'tweetId is required');
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet) {
        throw new ApiError(404, 'tweet does not exist');
    }

    return res.status(200)
    .json(new ApiResponse(200, tweet, 'Tweet fetched successfully'));
})


const updateTweet = asyncHandler(async(req, res)=> {
     const {tweetId} = req.params;
     const {content} = req.body;

     if(!tweetId) {
        throw new ApiError(400, 'tweetId is required');
     }

     if(!content) {
        throw new ApiError(400, 'content is required');
     }

     const tweet = await Tweet.findById(tweetId);
     if(!tweet) {
        throw new ApiError(404, 'tweet does not exist');
     }

     if(tweet.owner.equals(req.user._id)) {
        await Tweet.findByIdAndUpdate(
            tweetId,
            {$set:{content}},
            {new:true}
        );
     }else{
        throw new ApiError(401, "you can't update this tweet");
     }

     const updatedTweet = await Tweet.findById(tweetId);
     return res.status(200)
     .json(new ApiResponse(200, updatedTweet, 'tweet updated successfully'));
     

})


const deleteTweet = asyncHandler(async(req, res)=> {
    const {tweetId} = req.params;
     const {content} = req.body;

     if(!tweetId) {
        throw new ApiError(400, 'tweetId is required');
     }

     if(!content) {
        throw new ApiError(400, 'content is required');
     }

     const tweet = await Tweet.findById(tweetId);
     if(!tweet) {
        throw new ApiError(404, 'tweet does not exist');
     }

     if(tweet.owner.equals(req.user._id)) {
         await Tweet.findByIdAndDelete(tweetId);
        
     }else{
        throw new ApiError(401, "you can't delete this tweet");
     }

     return res.status(200)
     .json(new ApiResponse(200,{}, 'tweet deleted successfully'));

})










export {
    createTweet,
    getAllTweets,
    getAllTweetsByUser,
    getTweet,
    updateTweet,
    deleteTweet
}