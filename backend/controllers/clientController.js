const client = require('../models/clientModel')
const mongoose = require('mongoose')
const getClients = async (req,res)=>{
    try{
        const clients = await client.find({}).sort({createdAt:-1})
        res.status(200).json(clients)
    }catch(err){
        res.status(400).json({error:err.message})
    }
}

module.exports = {
    getClients
}