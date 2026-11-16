import mongoose from 'mongoose';
const exhibitorSchema = new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},expo:{type:mongoose.Schema.Types.ObjectId,ref:'Expo',required:true},company:{type:String,required:true},products:{type:String,default:''},description:{type:String,default:''},contact:{type:String,default:''},booth:{type:String,default:''},status:{type:String,enum:['pending','approved','rejected'],default:'pending'}},{timestamps:true});
export default mongoose.model('Exhibitor',exhibitorSchema);
