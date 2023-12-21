import asyncHandler from "express-async-handler";
import Stripe from "stripe";
import CalculateNextBillingdate from "../utils/calculatenextbillingDate.js";
import ShouldrenewSubscriptionPlan from "../utils/ShouldRenew.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

//stripe payments
const handleStripePayment = asyncHandler(async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { amount, subscriptionPlan } = req.body;
  const user = req.user;

  try {
    //create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
      //adding some meta data
      metadata: {
        userId: user._id.toString(),
        userEmail: user.email,
        subscriptionPlan,
      },
    });
    //send the response
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      metadata: paymentIntent.metadata,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//verify payment
const verifyPayment =asyncHandler(async (req,res)=>{
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const {paymentId} = req.params
    try {
        const paymentIntent  = await stripe.paymentIntents.retrieve(paymentId)
        if(paymentIntent.status!=='succeeded'){
          //get meta data
          const metadata = paymentIntent.metadata;
          const subscriptionPlan = metadata.subscriptionPlan;
          const userEmail = metadata.userEmail;
          const userId = metadata.userId;
          const userFound =  await User.findById(userId);
          if(!userFound){
            return res.status(404).json({
              status:"false",
              message:"user not found"
            })
          }
          //get payment details
          const amount =paymentIntent.amount/100;
          const currency =paymentIntent.currency;
          const paymentId =paymentIntent.id;

          //create payment history
          const newPayment = await Payment.create({
            user: userId,
            email:userEmail,
            subscriptionPlan,
            amount,
            currency,
            status:"success",
            refrence:paymentId,
            monthlyRequestCount:0
          });
          //check for subscription plan
          if(subscriptionPlan==='Basic'){
            //update the user
            const updatedUser = await User.findByIdAndUpdate(userId,{
              subscriptionPlan:'Basic',
              trailPeriod:0,
              nextBillingDate:CalculateNextBillingdate(),
              apiRequestCount: 0,
              monthlyRequestCount : 50,
              $addToSet:{payments:newPayment._id}
            });
            res.json({
              success:true,
              message:"Payment Verified, user Updtaed",
              updatedUser
            })
          }
          if(subscriptionPlan==='Premium'){
            //update the user
            const updatedUser = await User.findByIdAndUpdate(userId,{
              subscriptionPlan:'Premium',
              trailPeriod:0,
              nextBillingDate:CalculateNextBillingdate(),
              apiRequestCount: 0,
              monthlyRequestCount : 100,
              $addToSet:{payments:newPayment._id}
            });
            res.json({
              success:true,
              message:"Payment Verified, user Updtaed",
              updatedUser
            })
          }

        }
    } catch (er) {
        res.status(500).json({
          message:er.message
        })
    }
})
//stripe free payments
const handleFreePayments = asyncHandler(async (req, res) => {
  //get logged in user
  const user = req.user;

  try {
    if (ShouldrenewSubscriptionPlan(user)) {
      user.subscriptionPlan = "Free";
      user.monthlyRequestCount = 5;
      user.apiRequestCount = 0;
      user.nextBillingDate = CalculateNextBillingdate();
      //create new payment to save in database
      const newPayment = await Payment.create({
          user: user._id,
          refrence: Math.random().toString(36).substring(7),
          currency: "inr",
          status: "success",
          subscriptionPlan: "Free",
          monthlyRequestCount:5,
          amount: 0,
        });
        user.payments.push(newPayment._id);
        await user.save();
        res.json({
        status: "success",
        message: "Subscription Plan updated successfully",
        user,
      });
    } else {
      return res.status(403).json({
        error: "Subscription renewal not due yet",
      });
    }
  } catch (error) {
    res.status(500).json({
        error:error.message
    });
  }
});
export { handleStripePayment, handleFreePayments,verifyPayment };
