import mongoose from 'mongoose';
const sessionSchema = new mongoose.Schema({expo:{type:mongoose.Schema.Types.ObjectId,ref:'Expo',required:true},title:{type:String,required:true},speaker:{type:String,default:''},topic:{type:String,default:''},location:{type:String,default:''},startTime:{type:Date,required:true},endTime:{type:Date}},{timestamps:true});
export default mongoose.model('Session',sessionSchema);
