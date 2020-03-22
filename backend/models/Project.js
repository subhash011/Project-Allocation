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
    
})

module.exports=mongoose.model('Project',UserSchema);
