const Tutor = require('../models/tutorModel')
const mongoose = require('mongoose')
// const Notification = require('../models/notificationModel');
// get all tutors
const getTutors = async (req,res)=>{
    try{
        // -1降序排列
        const tutors = await Tutor.find({}).sort({createdAt:-1})
        res.status(200).json(tutors)
    }catch(err){
        res.status(400).json({error:err.message})
    }
}


module.exports = {
    getTutors
}
