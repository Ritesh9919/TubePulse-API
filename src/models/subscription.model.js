import mongoose, { Schema, SchemaType } from "mongoose";


const subcriptionSchema = new mongoose.Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // One who is subscribing
        ref:'User'
    },
    channel:{
        type:Schema.Types.ObjectId, // One to whom 'subscriber is subscibing
        ref:'User'
    }

}, {timestamps:true});



export const Subcription = mongoose.model('Subscription', subcriptionSchema);