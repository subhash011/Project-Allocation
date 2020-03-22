const mongoose=require('mongoose');

const UserSchema=new mongoose.Schema({
   name:{
      type:String,
      required:true
   },
   roll_no:{
       type: String,
       required:true
   },
   email:{
      type:String,
      required:true
   },
   gpa:{
      type:Number,
      required:true
   },
   stream:{
      type:String,
      required:true
   },
   projects_chosen:{
      type:[]
   },
   project_alloted:{
        type:[]
   },
   date:{
      type:Date,
      default:Date.now
   }
})

module.exports=mongoose.model('Student',UserSchema);
