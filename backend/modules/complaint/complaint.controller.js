const Complaint = require("./complaint.model");
const aiService = require("../ai/ai.service");
const { sendError } = require("../../utils/error");

const VALID_STATUSES = ["pending", "assigned", "in-progress", "resolved"];

const toNumber = (value) => {
 const number = Number(value);
 return Number.isFinite(number) ? number : null;
};

exports.createComplaint = async(req,res)=>{

 try{

  const {description,lat,lng} = req.body;

    if (!req.user?.id) {
     return sendError(res, {
        status: 401,
        message: "You must be logged in to submit a complaint",
        code: "COMPLAINT_UNAUTHORIZED"
     });
    }

    if (!description || !String(description).trim()) {
     return sendError(res, {
        status: 400,
        message: "Complaint description is required",
        code: "COMPLAINT_DESCRIPTION_REQUIRED"
     });
    }

    const latitude = toNumber(lat);
    const longitude = toNumber(lng);

    if (latitude === null || longitude === null) {
     return sendError(res, {
        status: 400,
        message: "Valid latitude and longitude are required",
        code: "COMPLAINT_LOCATION_INVALID"
     });
    }

  const imagePath = req.file ? req.file.path : null;

  const aiResult = await aiService.classifyComplaint({
   text: description,
   imagePath
  });

  const complaint = await Complaint.create({

   description,
   image:imagePath,
   category:aiResult.category,
   department:aiResult.department,

   location:{
    lat: latitude,
    lng: longitude
   },

   user:req.user.id

  });

  res.json({
   message:"Complaint submitted",
   complaint
  });

 }catch(error){
    return sendError(res, {
     status: 500,
     message: "Unable to submit complaint right now",
     code: "COMPLAINT_CREATE_FAILED",
     error
    });

 }

};

exports.getUserComplaints = async(req,res)=>{

 try{

  const complaints = await Complaint.find({
   user:req.user.id
  });

  res.json(complaints);

 }catch(err){
    return sendError(res, {
     status: 500,
     message: "Unable to fetch your complaints",
     code: "COMPLAINT_LIST_USER_FAILED",
     error: err
    });
 }

};

exports.getAllComplaints = async(req,res)=>{

 try {

 const complaints = await Complaint.find()
 .populate("user","name email");

 res.json(complaints);

 } catch (error) {
    return sendError(res, {
     status: 500,
     message: "Unable to fetch complaints",
     code: "COMPLAINT_LIST_ALL_FAILED",
     error
    });
 }

};

exports.updateStatus = async(req,res)=>{

 try{

  const {status} = req.body;

    if (!VALID_STATUSES.includes(status)) {
     return sendError(res, {
        status: 400,
        message: "Status must be one of: pending, assigned, in-progress, resolved",
        code: "COMPLAINT_STATUS_INVALID"
     });
    }

  const complaint = await Complaint.findByIdAndUpdate(

   req.params.id,

   {status},

   {new:true}

  );

    if (!complaint) {
     return sendError(res, {
        status: 404,
        message: "Complaint not found",
        code: "COMPLAINT_NOT_FOUND"
     });
    }

  res.json({
   message:"Status updated",
   complaint
  });

 }catch(err){
    return sendError(res, {
     status: 500,
     message: "Unable to update complaint status",
     code: "COMPLAINT_STATUS_UPDATE_FAILED",
     error: err
    });

 }

};