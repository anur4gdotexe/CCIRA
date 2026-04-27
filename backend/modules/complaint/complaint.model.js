const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({

 description:{
  type:String,
  required:true
 },

 image:{
  type:String
 },

 category:{
  type:String
 },

 department:{
  type:String
 },

 location:{
  lat:Number,
  lng:Number
 },

 status:{
  type:String,
  enum:["pending","assigned","in-progress","resolved"],
  default:"pending"
 },

 user:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 }

},{timestamps:true});

module.exports = mongoose.model("Complaint",ComplaintSchema);