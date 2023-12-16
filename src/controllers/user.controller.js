import {asyncHandler} from '../utils/asyncHandler.js';
import {User} from '../models/user.model.js';



const registerUser = asyncHandler(async(req, res)=> {
   res.json({message:'Ok'});
})


export {
    registerUser
}