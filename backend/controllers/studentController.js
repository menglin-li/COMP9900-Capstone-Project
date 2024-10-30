const Student = require('../models/studentModel')
const mongoose = require('mongoose')
const Notification = require('../models/notificationModel');
const getStudents = async (req,res)=>{
    try{
        const students = await Student.find({}).sort({createdAt:-1})
        res.status(200).json(students)
    }catch(err){
        res.status(400).json({error:err.message})
    }
}

// 更新学生信息
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({error:'student id is not valid'})
        }

        // 使用 findByIdAndUpdate 方法更新学生信息
        const updatedStudent = await Student.findOneAndUpdate(
            {_id:id},
            {...req.body},
            {new: true} // 返回更新后的文档，并应用验证
        );

        if (!updatedStudent) {
            return res.status(404).json({ c: 'Student not found' });
        }

        res.status(200).json(updatedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// get student by id
const getStudentById = async (req,res)=>{
    const {id} = req.params
    if (!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({message:'Student not found'})
    }
    const student = await Student.findById(id)


    res.status(200).json(student)
}

module.exports = {
    updateStudent,
    getStudents,
    getStudentById
}