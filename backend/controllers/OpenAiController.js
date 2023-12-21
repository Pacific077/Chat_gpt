import asyncHandler from "express-async-handler"
import axios from "axios"
import ContentHistory from "../models/ContentHistory.js"
import User from "../models/User.js"

const OpenAiController = asyncHandler(async(req,res)=>{
    const {prompt} = req.body
    try {
        const response =   await axios.post('https://api.openai.com/v1/completions',{
            model : "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens:70
        },{
            headers:{
                Authorization : `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-type':"application/json"
            }
        })
        //create the history

        const content = response.data.choices[0].text.trim()
        const newCont  = await ContentHistory.create({
            user:req.user,
            content
        })
        //push history in user
        const Userfound = await User.findById(req.user._id);
        Userfound.history.push(newCont._id)
        //update api request count
        Userfound.apiRequestCount+=1;
        await Userfound.save();
        res.status(200).json(content)
    } catch (error) {
        res.send(error)
    }
})

export {OpenAiController}