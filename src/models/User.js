const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   name:{
      type:String,
      required:true
   },

   email:{
      type:String,
      required:true,
      unique:true
   },

   phone:{
      type:String,
      required:true,
      unique:true
   },

   aadhaarNumber:String,

   panNumber:String,

   gstNumber:String,

   aadhaarVerified:{
      type:Boolean,
      default:false
   },

   panVerified:{
      type:Boolean,
      default:false
   },

   gstVerified:{
      type:Boolean,
      default:false
   },

   isKycVerified:{
      type:Boolean,
      default:false
   },

   kycStatus:{
      type:String,
      enum:[
         "pending",
         "in_progress",
         "pending_review",
         "approved",
         "rejected"
      ],
      default:"pending"
   },

   aadhaarData:Object,

   aadhaarReferenceId: { type: String, default: null },
   aadhaarName: { type: String, default: null },
   aadhaarDob: { type: String, default: null },
   aadhaarGender: { type: String, default: null },
   aadhaarAddress: { type: mongoose.Schema.Types.Mixed, default: null },
   isAadhaarVerified: { type: Boolean, default: false },

   panVerificationData:Object,

   gstVerificationData:Object,

   sellerType: {
      type: String,
      enum: ['individual', 'business'],
      required: true,
      default: 'individual'
   },

   emailOTP: {
      type: String,
      default: null
   },

   emailOTPExpires: {
      type: Date,
      default: null
   },

   isEmailVerified: {
      type: Boolean,
      default: false
   },

   rejectionReason: {
      type: String,
      default: null
   },

   reviewedAt: {
      type: Date,
      default: null
   },

   reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
   },

   reuploadCount: {
      type: Number,
      default: 0
   },

   documents: {
      aadhaar: { type: String, default: null },
      pan: { type: String, default: null },
      gst: { type: String, default: null },
      selfie: { type: String, default: null }
   },

   selfieImage:String,

   panImage:String,

   gstImage:String,

   refreshTokens: [{
      type: String
   }]

},{timestamps:true});

module.exports = mongoose.model('User', userSchema);
