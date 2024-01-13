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



export {
    createTweet
}


