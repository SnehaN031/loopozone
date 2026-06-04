# Loopozone Platform Service API Suite Documentation

This document provides the complete API specifications, payload schemas, and response formats for integrating the frontend with the Loopozone Backend.

---

## Table of Contents
1. [Overview & Authentication](#1-overview--authentication)
2. [User Authentication & OTP Flow](#2-user-authentication--otp-flow)
3. [KYC Document Upload & Validation (Sellers)](#3-kyc-document-upload--validation-sellers)
4. [Compliance Administrator Operations](#4-compliance-administrator-operations)
5. [Indicative Prices & Categories CMS](#5-indicative-prices--categories-cms)
6. [User Profile & Dashboard](#6-user-profile--dashboard)
7. [Complete Endpoints Cheat Sheet](#7-complete-endpoints-cheat-sheet)

---

## 1. Overview & Authentication

* **Base URL**: `http://localhost:3000` (or `http://192.168.0.82:3000` on the local network)
* **Static File Assets**: Served directly under `/uploads/...` (e.g. `http://localhost:3000/uploads/pan/pan_card.png`)
* **Headers**: All protected endpoints require a bearer token in the HTTP headers:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

---

## 2. User Authentication & OTP Flow

### Check User
Checks if a phone number is registered.
* **Method & Path**: `POST /auth/check-user`
* **Request Payload (JSON)**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
* **Response (200 OK - Existing User)**:
  ```json
  {
    "success": true,
    "existingUser": true,
    "isKycVerified": false,
    "redirect": "/login"
  }
  ```
* **Response (200 OK - New User)**:
  ```json
  {
    "success": true,
    "existingUser": false,
    "redirect": "/signup"
  }
  ```

### Signup / Registration
Registers a new user and returns a temporary onboarding JWT token.
* **Method & Path**: `POST /auth/signup`
* **Request Payload (JSON)**:
  ```json
  {
    "name": "Sneha Nair",
    "email": "sneha@gmail.com",
    "phone": "+919876543210"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Signup successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "name": "Sneha Nair",
      "email": "sneha@gmail.com",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```

### Send Phone OTP (Login)
Sends a login verification code via SMS.
* **Method & Path**: `POST /auth/send-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "otp_sent",
    "message": "OTP sent. Dev mode: use 123456"
  }
  ```
* **KYC Pending Review Response**:
  ```json
  {
    "success": false,
    "pendingReview": true,
    "message": "Your KYC is currently under admin review. Please wait for approval."
  }
  ```

### Verify Phone OTP (Login)
Validates the login OTP code and returns the session JWT access token.
* **Method & Path**: `POST /auth/verify-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "phone": "+919876543210",
    "otp": "123456"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "name": "Sneha Nair",
      "email": "sneha@gmail.com",
      "phone": "+919876543210",
      "isEmailVerified": true,
      "isKycVerified": true,
      "kycStatus": "approved"
    }
  }
  ```

### Send Email OTP (Protected)
Generates and logs an email verification code (visible in backend logs).
* **Method & Path**: `POST /auth/send-email-otp`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email OTP sent successfully"
  }
  ```

### Verify Email OTP (Protected)
Submits the code from the console to verify the email address.
* **Method & Path**: `POST /auth/verify-email-otp`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "otp": "489215"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully",
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "isEmailVerified": true
    }
  }
  ```

---

## 3. KYC Document Upload & Validation (Sellers)

### Update Seller Type (Protected)
Sets whether the seller is an individual or business.
* **Method & Path**: `POST /kyc/seller-type`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "sellerType": "individual"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Seller type successfully updated to individual",
    "sellerType": "individual"
  }
  ```

### Get KYC Status (Protected)
Gets the progress of document verification checklists.
* **Method & Path**: `GET /kyc/status`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "sellerType": "individual",
    "isKycVerified": false,
    "kycStatus": "pending",
    "rejectionReason": null,
    "progress": {
      "completed": 0,
      "total": 3,
      "percentage": 0
    },
    "documents": {
      "aadhaar": "pending",
      "pan": "pending",
      "selfie": "pending"
    }
  }
  ```

### Send Aadhaar OTP (Protected)
Triggers OTP generation for Aadhaar verification.
* **Method & Path**: `POST /kyc/aadhaar/send-otp`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "aadhaarNumber": "123456789012"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Aadhaar OTP sent successfully",
    "referenceId": "ref_mock_1780477977951_864531",
    "devOtp": "123456"
  }
  ```

### Verify Aadhaar OTP (Protected)
Submits the Aadhaar OTP code for validation.
* **Method & Path**: `POST /kyc/aadhaar/verify-otp`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "otp": "123456",
    "referenceId": "ref_mock_1780477977951_864531",
    "aadhaarNumber": "123456789012"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Aadhaar verified successfully",
    "aadhaarData": {
      "name": "Test Runner",
      "date_of_birth": "17-10-2002",
      "gender": "Female",
      "address": "Flat 302, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103, India",
      "masked_aadhaar": "XXXXXXXX9012"
    }
  }
  ```

### Verify PAN (Protected)
Uploads PAN image and triggers OCR verification.
* **Method & Path**: `POST /kyc/pan/verify`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (multipart/form-data)**:
  - `panImage` (File: `.png` / `.jpg` image)
  - `pan` (Text string: E.g., `ODZPS8086J`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "PAN card verified successfully",
    "data": {
      "pan": "ODZPS8086J"
    }
  }
  ```

### Verify GST (Protected)
Uploads GST certificate and triggers OCR validation (Business sellers only).
* **Method & Path**: `POST /kyc/gst/verify`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (multipart/form-data)**:
  - `gst` (File: `.png` / `.jpg` / `.pdf` file)
  - `gstNumber` (Text string: E.g., `29ABCDE1234F1Z5`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "GST certificate verified successfully",
    "data": {
      "gstin": "29ABCDE1234F1Z5",
      "panMatch": true,
      "gstinMatch": true
    }
  }
  ```

### Upload Selfie (Protected)
Uploads the selfie image.
* **Method & Path**: `POST /kyc/selfie`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Request Payload (multipart/form-data)**:
  - `selfie` (File: `.png` / `.jpg` image)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Selfie uploaded successfully",
    "filePath": "/uploads/selfie/selfie-1780477979.png",
    "pendingReview": true,
    "kycStatus": "pending_review"
  }
  ```

### Submit KYC Onboarding (Protected)
Submits all uploaded documents to the admin queue for review.
* **Method & Path**: `POST /kyc/submit`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC documents submitted successfully",
    "kycStatus": "pending_review"
  }
  ```

### Reupload KYC Reset (Protected)
Resets document verified flags and upload paths after a rejection.
* **Method & Path**: `POST /kyc/reupload`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC reset. Please re-upload your documents.",
    "kycStatus": "in_progress"
  }
  ```

---

## 4. Compliance Administrator Operations

### Admin Login
Authenticates an admin user and issues an admin JWT.
* **Method & Path**: `POST /admin/login`
* **Request Payload (JSON)**:
  ```json
  {
    "email": "admin@loopozone.com",
    "password": "Admin@123456"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "_id": "6a1e85b54f545d9d088360dd",
      "name": "Loopozone Admin",
      "email": "admin@loopozone.com",
      "role": "admin"
    }
  }
  ```

### Get Pending KYC List
Retrieves all users pending review.
* **Method & Path**: `GET /admin/kyc/pending`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "users": [
      {
        "_id": "6a1ff019bc3243239ba3ccd1",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+919876543210",
        "kycStatus": "pending_review"
      }
    ]
  }
  ```

### Get User Document Detail
Retrieves detailed documents, logs, and generated credential helpers for a specific user ID.
* **Method & Path**: `GET /admin/kyc/user/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "kycStatus": "pending_review",
      "sellerType": "individual",
      "aadhaarNumber": "XXXXXXXX9012",
      "panNumber": "ODZPS8086J",
      "username": "john.doe",
      "password": "john.doe_password_10",
      "selfieImage": "/uploads/selfie/selfie.png",
      "panImage": "/uploads/pan/pan_card.png"
    }
  }
  ```

### Approve KYC
Approves the user's KYC, allowing them full dashboard access.
* **Method & Path**: `POST /admin/kyc/approve/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC approved successfully",
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "kycStatus": "approved",
      "isKycVerified": true,
      "username": "john.doe",
      "password": "john.doe_password_10"
    }
  }
  ```

### Reject KYC
Rejects the user's KYC with a detailed explanation (minimum 10 characters).
* **Method & Path**: `POST /admin/kyc/reject/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "reason": "PAN card photo is blurry and unreadable."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC rejected",
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "kycStatus": "rejected",
      "rejectionReason": "PAN card photo is blurry and unreadable."
    }
  }
  ```

### Get All KYC Records
Queries all accounts with paginated filters.
* **Method & Path**: `GET /admin/kyc/all`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Query Parameters (Optional)**: `status` (e.g. `?status=approved`), `page` (e.g. `?page=1`), `limit` (e.g. `?limit=10`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "total": 45,
    "page": 1,
    "pages": 5,
    "users": [...]
  }
  ```

### Create Administrator Account
Creates a new administrative staff profile.
* **Method & Path**: `POST /admin/create`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "name": "Audit Team",
    "email": "audit@loopozone.com",
    "password": "AuditPassword@12345"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Admin created",
    "admin": {
      "_id": "6a1fef3ebc3243239ba3cc99",
      "name": "Audit Team",
      "email": "audit@loopozone.com",
      "role": "admin"
    }
  }
  ```

---

## 5. Indicative Prices & Categories CMS

### Get Public Prices (No Auth)
Reads indicative scrap prices (supports city filtering).
* **Method & Path**: `GET /prices`
* **Query Parameters (Optional)**: `city` (e.g., `?city=mumbai`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "prices": [
      {
        "_id": "6a1fd205cf6b4094b436b086",
        "materialName": "Pet Bottles",
        "pricePerKg": 24,
        "priceChange": 0.5,
        "city": "Mumbai"
      }
    ]
  }
  ```

### Get Public Categories (No Auth)
Reads active scrap categories.
* **Method & Path**: `GET /categories`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "categories": [
      {
        "_id": "6a1fc3ab895a59174f1b0767",
        "name": "Plastic",
        "description": "PET, HDPE, PVC",
        "icon": "droplet",
        "isActive": true
      }
    ]
  }
  ```

### Create Price Record (Admin Auth)
* **Method & Path**: `POST /admin/prices`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "materialName": "Copper Wire",
    "pricePerKg": 450,
    "city": "Mumbai"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Price record created successfully",
    "price": {
      "_id": "6a1fd205cf6b4094b436b088",
      "materialName": "Copper Wire",
      "pricePerKg": 450,
      "priceChange": 0,
      "city": "Mumbai"
    }
  }
  ```

### Update Price Record (Admin Auth)
Modifies the scrap rate, automatically computing price changes.
* **Method & Path**: `PUT /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "pricePerKg": 455
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "price": {
      "_id": "6a1fd205cf6b4094b436b088",
      "pricePerKg": 455,
      "priceChange": 5
    }
  }
  ```

### Delete Price Record (Admin Auth)
* **Method & Path**: `DELETE /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Price record deleted successfully"
  }
  ```

### Create Category (Admin Auth)
* **Method & Path**: `POST /admin/categories`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "name": "E-Waste",
    "description": "Electronics, Batteries",
    "icon": "zap",
    "isActive": true
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "category": {
      "_id": "6a1fc3ab895a59174f1b0769",
      "name": "E-Waste",
      "icon": "zap",
      "isActive": true
    }
  }
  ```

### Update Category (Admin Auth)
* **Method & Path**: `PUT /admin/categories/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "isActive": false
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "category": {
      "_id": "6a1fc3ab895a59174f1b0769",
      "name": "E-Waste",
      "isActive": false
    }
  }
  ```

### Delete Category (Admin Auth)
* **Method & Path**: `DELETE /admin/categories/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```

---

## 6. User Profile & Dashboard

### Get User Profile (Protected)
Gets details for the logged-in user.
* **Method & Path**: `GET /user/profile`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "isKycVerified": true,
      "kycStatus": "approved"
    }
  }
  ```

### Get Gated Dashboard Data (Protected & KYC Gated)
Retrieves metrics (only accessible after KYC is approved).
* **Method & Path**: `GET /user/dashboard`
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a1ff019bc3243239ba3ccd1",
      "name": "John Doe",
      "isKycVerified": true
    },
    "metrics": {
      "investmentBalance": "₹1,24,500.00",
      "portfolioYield": "+12.4%",
      "activeAssets": 3
    }
  }
  ```

---

## 7. Complete Endpoints Cheat Sheet

```text
========================================================================
Path                             Method   Auth Req   Type
========================================================================
/auth/check-user                 POST     No         Checks if phone is registered
/auth/signup                     POST     No         Registers new account (Onboarding JWT)
/auth/send-otp                   POST     No         Login OTP (dev code: 123456)
/auth/verify-otp                 POST     No         Verify login OTP (Main Access JWT)
/auth/send-email-otp            POST     Yes        Send email OTP
/auth/verify-email-otp          POST     Yes        Verify email OTP

/kyc/seller-type               POST     Yes        Set individual/business type
/kyc/status                     GET      Yes        Get document status list
/kyc/aadhaar/send-otp          POST     Yes        Send Aadhaar OTP
/kyc/aadhaar/verify-otp        POST     Yes        Verify Aadhaar OTP
/kyc/pan/verify                POST     Yes        Verify PAN card (multipart)
/kyc/gst/verify                POST     Yes        Verify GST cert (multipart)
/kyc/selfie                    POST     Yes        Upload selfie (multipart)
/kyc/submit                    POST     Yes        Submit documents to queue
/kyc/reupload                  POST     Yes        Reset rejected files

/admin/login                    POST     No         Admin login authentication
/admin/kyc/pending              GET      Yes (Adm)  Get list of pending audits
/admin/kyc/user/:userId         GET      Yes (Adm)  Get user documents and credentials
/admin/kyc/approve/:userId      POST     Yes (Adm)  Approve KYC request
/admin/kyc/reject/:userId       POST     Yes (Adm)  Reject KYC request (reason)
/admin/kyc/all                  GET      Yes (Adm)  Get all users list (paginated)
/admin/create                   POST     Yes (Adm)  Create new admin staff profile

/admin/prices                   POST     Yes (Adm)  Create Price Listing
/admin/prices                   GET      Yes (Adm)  List Price Listings
/admin/prices/:id               PUT      Yes (Adm)  Update Price Listing
/admin/prices/:id               DELETE   Yes (Adm)  Delete Price Listing

/admin/categories               POST     Yes (Adm)  Create Category
/admin/categories               GET      Yes (Adm)  List Categories
/admin/categories/:id           PUT      Yes (Adm)  Update Category
/admin/categories/:id           DELETE   Yes (Adm)  Delete Category

/prices                         GET      No         Get public active prices
/categories                     GET      No         Get public active categories

/user/profile                  GET      Yes        Fetch logged-in profile
/user/dashboard                GET      Yes (KYC)  Fetch gated dashboard (Approved only)
========================================================================
```
