const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean
    },
    stream:{
        type:String,
        required:true
    },
    project_list:{
        type:[]
    },
    student_preference:{
        type:[]
    },
    date:{
        type:Date,
        default:Date.now
     }
})

module.exports=mongoose.model('Faculty',UserSchema);
