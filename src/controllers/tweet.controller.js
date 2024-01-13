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

export {
    createTweet,
    getUserTweets
}


