import express from 'express'
import IsAuthenticated from '../middlewares/isAuthenticated.js'
import {handleFreePayments, handleStripePayment, verifyPayment} from '../controllers/HandleStripePayment.js'

const stripeRouter = express.Router()

stripeRouter.post('/checkout',IsAuthenticated,handleStripePayment)
stripeRouter.post('/free-plan',IsAuthenticated,handleFreePayments)
stripeRouter.post('/verify-payment/:paymentId',IsAuthenticated,verifyPayment)

export default stripeRouter