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
    }],

    role: {
       type: String,
       enum: ['buyer', 'seller'],
       default: 'seller'
    },

    membershipType: {
       type: String,
       default: 'Standard Member'
    },

    sellerLevel: {
       type: String,
       default: 'Bronze Seller'
    },

    wallet: {
       balance: { type: Number, default: 0 },
       totalEarnings: { type: Number, default: 0 },
       withdrawnAmount: { type: Number, default: 0 },
       pendingSettlement: { type: Number, default: 0 }
    },

    ordersSummary: {
       total: { type: Number, default: 0 },
       pending: { type: Number, default: 0 },
       processing: { type: Number, default: 0 },
       completed: { type: Number, default: 0 },
       cancelled: { type: Number, default: 0 }
    },

    ratingsSummary: {
       averageRating: { type: Number, default: 4.8 },
       totalReviews: { type: Number, default: 0 },
       distribution: {
          5: { type: Number, default: 0 },
          4: { type: Number, default: 0 },
          3: { type: Number, default: 0 },
          2: { type: Number, default: 0 },
          1: { type: Number, default: 0 }
       }
    },

    recentActivity: [{
       title: String,
       description: String,
       timestamp: { type: Date, default: Date.now }
    }],

    savedAddresses: [{
       title: String,
       addressLine: String,
       city: String,
       state: String,
       pincode: String
    }],

    languagePreference: {
       type: String,
       default: 'English'
    },

    notificationPreferences: {
       emailNotifications: { type: Boolean, default: true },
       smsNotifications: { type: Boolean, default: true },
       pushNotifications: { type: Boolean, default: true },
       orderUpdates: { type: Boolean, default: true },
       walletUpdates: { type: Boolean, default: true },
       promotionalUpdates: { type: Boolean, default: false }
    },

    securitySettings: {
       twoFactorEnabled: { type: Boolean, default: false },
       activeSessions: [{
          device: String,
          ip: String,
          lastActive: { type: Date, default: Date.now }
       }]
    }

},{timestamps:true});

module.exports = mongoose.model('User', userSchema);
