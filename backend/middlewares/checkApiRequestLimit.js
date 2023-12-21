import asyncHandler from "express-async-handler"
import User from "../models/User.js"

const CheckApiRequestLimit = asyncHandler( async(req,res,next)=>{
    console.log("check api request limit middleware")
    if(!req.user){
        return res.status(401).json({
            message: "Not authorized"
        })
    }
    const user =await User.findById(req.user._id);
    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
    let requestUserLimit = 0;
    if(user.trialActive){
        requestUserLimit=user.monthlyRequestCount;
    }
    if(user.apiRequestCount>=requestUserLimit){
        throw new Error("Api request limit reached!! Please Subscribe")
    }
    next();
})
export default CheckApiRequestLimit