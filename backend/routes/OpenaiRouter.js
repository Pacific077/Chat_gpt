import express from "express"
import IsAuthenticated from "../middlewares/isAuthenticated.js";
import { OpenAiController } from "../controllers/OpenAiController.js";
import CheckApiRequestLimit from "../middlewares/checkApiRequestLimit.js";
const Openairouter  =  express.Router();

Openairouter.post("/genarate",IsAuthenticated,CheckApiRequestLimit,OpenAiController)

export default Openairouter