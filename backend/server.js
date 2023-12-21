import express from "express";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import UserRouter from "./routes/UserRoutes.js";
import dotenv from "dotenv";
import ConnectDb from "./utils/connectDb.js";
import Apperr from "./middlewares/errhandler.js";
import Openairouter from "./routes/OpenaiRouter.js";
import stripeRouter from "./routes/StripeRouter.js";
import User from "./models/User.js";
import cors from "cors"
ConnectDb();
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

//cron for trail period running every single day
cron.schedule("0 0 * * * *", async () => {
  try {
    const today = new Date();
    await User.updateMany(
      {
        trialActive: true,
        trailExpires: { $lt: today },
      },
      {
        trialActive: false,
        subscriptionPlan: "Free",
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//cron for free plan running every single day
cron.schedule("0 0 * * * *", async () => {
  try {
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Free",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//cron for Basic plan running every single day
cron.schedule("0 0 * * * *", async () => {
  try {
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Basic",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//cron for Premium plan running every single day
cron.schedule("0 0 * * * *", async () => {
  try {
    const today = new Date();
    await User.updateMany(
      {
        subscriptionPlan: "Premium",
        nextBillingDate: { $lt: today },
      },
      {
        monthlyRequestCount: 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//middllewares
app.use(express.json());
app.use(cookieParser());
//cors
const corsOptions = {
  origin:'http://localhost:3000',
  credentials: true
}
app.use(cors(corsOptions));
//routes
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/openai", Openairouter);
app.use("/api/v1/stripe", stripeRouter);

//error Handlers //

app.use(Apperr);

app.listen(PORT, () => {
  console.log(`Sever is running on port ${PORT}`);
});
