//register

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  //all feilds req
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All details are required");
  }
  //if already registerd
  const UserExists = await User.findOne({ email });
  if (UserExists) {
    res.status(400);
    throw new Error("User already exists");
  }
  //hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);
  const newUser = await User.create({
    username,
    email,
    password: hashedPass,
  });

  // add the trail end date
  newUser.trailExpires = new Date(
    new Date().getTime() + newUser.trailPeriod * 24 * 60 * 60 * 1000
  );
  await newUser.save();
  res.json({
    success: true,
    message: "user registerd",
    data: newUser,
  });
});
//login
const LoginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All details are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Not a valid User");
  }
  //check valid password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401);
    throw new Error("invalid password");
  }
  //genarate jwt
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  //send token to cookie (http only)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  //send the response
  res.json({
    status: "success",
    message: "logged in",
    data: user,
  });
});
//logout

const LogoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({
    message: "logged out successfully",
  });
});
//profile

const UserProfile = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const user = await User.findById(id)
    .select("-password")
    .populate("payments")
    .populate("history");
  if (user) {
    res.status(200).json({
      message: "user profile success",
      data: user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
//check User auth status

const CheckAuth = asyncHandler( async(req,res) =>{
    const decoded = jwt.verify(req.cookies.token,process.env.JWT_SECRET);
    if(decoded){
        res.json({
            data:true,
        })
    }else{
        res.json({
            data:false
        })
    }
})

export { registerUser, LoginUser, LogoutUser, UserProfile,CheckAuth };
