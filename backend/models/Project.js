const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:String,
        required:true
    },
    studentIntake:{
        type:Number,
        required:true
    },
    stream:{
        type:String,
        required:true
    },
    faculty_id:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true
    },
    students_id:{
        type:[mongoose.SchemaTypes.ObjectId]
    }
})

module.exports=mongoose.model('Project',UserSchema);
