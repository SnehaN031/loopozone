# Platform Service API Documentation (Frontend Integration)

This document provides the complete API specifications, payload details, and sample response structures for integrating the frontend with the Platform Service (Loopozone KYC & Auth).

---

## Table of Contents
1. [Overview & Authentication](#1-overview--authentication)
2. [User Auth & OTP Flow](#2-user-auth--otp-flow)
3. [KYC Document Upload & Verification (CRUD)](#3-kyc-document-upload--verification-crud)
4. [Compliance Admin Endpoints](#4-compliance-admin-endpoints)
5. [User profile & Dashboard](#5-user-profile--dashboard)
6. [Prices & Categories CMS Endpoints](#6-prices--categories-cms-endpoints)
7. [Complete Endpoint Reference List](#7-complete-endpoint-reference-list)

---

## 1. Overview & Authentication
* **Base URL**: `http://localhost:5000`
* **Static Assets**: Accessible under `/uploads/...` (e.g., `http://localhost:5000/uploads/pan/pan-1780.jpg`)
* **Token Structure**:
  * **Access Token**: Short-lived (expires in 15 minutes). Sent in the `Authorization: Bearer <ACCESS_TOKEN>` header for protected endpoints.
  * **Refresh Token**: Long-lived (expires in 7 days). Used to request a new access token when it expires.

---

## 2. User Auth & OTP Flow

### Check User
Checks if a phone number is already registered in the system.
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

### Signup
Registers a new user and generates a temporary JWT session.
* **Method & Path**: `POST /auth/signup`
* **Request Payload (JSON)**:
  ```json
  {
    "name": "Kavya Madhavan",
    "email": "kavya@example.com",
    "phone": "+919876543210"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Signup successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",        // Access Token
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...", // Refresh Token
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "email": "kavya@example.com",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "isKycVerified": false,
      "kycStatus": "pending",
      "rejectionReason": null
    }
  }
  ```

### Send Phone OTP (Protected)
Generates and stores a login OTP for the entered phone number.
* **Method & Path**: `POST /auth/send-otp`
* **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "otp_sent",
    "message": "OTP sent. Dev mode: use 123456"
  }
  ```
* **KYC Pending Review Block Response (200 OK)**:
  ```json
  {
    "success": false,
    "pendingReview": true,
    "message": "Your KYC is currently under admin review. Please wait for approval."
  }
  ```
* **KYC Rejected Block Response (200 OK)**:
  ```json
  {
    "success": false,
    "rejected": true,
    "message": "KYC rejected",
    "reason": "PAN image is blurry",
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### Verify Phone OTP
Verifies the 6-digit OTP code and issues a secure JWT token.
* **Method & Path**: `POST /auth/verify-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "phone": "+919876543210",
    "otp": "123456"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",        // Access Token
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...", // Refresh Token
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "email": "kavya@example.com",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "isKycVerified": false,
      "kycStatus": "pending",
      "rejectionReason": null
    }
  }
  ```

### Send Email OTP (Protected)
Generates and sends a 6-digit verification code to the authenticated user's email.
* **Method & Path**: `POST /auth/send-email-otp`
* **Request Payload**: None
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email OTP sent successfully"
  }
  ```

### Verify Email OTP (Protected)
Verifies the email verification code.
* **Method & Path**: `POST /auth/verify-email-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "otp": "654321"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully",
    "user": {
      "_id": "6a1e80e13316b...",
      "name": "Kavya Madhavan",
      "email": "kavya@example.com",
      "phone": "+919876543210",
      "isEmailVerified": true,
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```

### Refresh Access Token
Request a new access token using a valid, non-expired refresh token.
* **Method & Path**: `POST /auth/refresh`
* **Request Payload (JSON)**:
  ```json
  {
    "refreshToken": "<YOUR_CURRENT_REFRESH_TOKEN>"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "<NEW_ACCESS_TOKEN>",
    "refreshToken": "<NEW_REFRESH_TOKEN>"
  }
  ```

### Logout / Revoke Session (Protected)
Invalidates the current session by removing the refresh token from the database.
* **Method & Path**: `POST /auth/logout`
* **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
* **Request Payload (JSON)**:
  ```json
  {
    "refreshToken": "<YOUR_CURRENT_REFRESH_TOKEN>"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 3. KYC Document Upload & Verification (CRUD)

### Send Aadhaar OTP (Protected)
Triggers OTP request to UIDAI/Sandbox for Aadhaar verification.
* **Method & Path**: `POST /kyc/aadhaar/send-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "aadhaarNumber": "123456789012"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Aadhaar OTP sent successfully",
    "referenceId": "ref_mock_1780392600000"
  }
  ```

### Verify Aadhaar OTP (Protected)
Submits the 6-digit OTP to verify Aadhaar details.
* **Method & Path**: `POST /kyc/aadhaar/verify-otp`
* **Request Payload (JSON)**:
  ```json
  {
    "otp": "123456",
    "referenceId": "ref_mock_1780392600000",
    "aadhaarNumber": "123456789012"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Aadhaar verified successfully",
    "aadhaarData": {
      "name": "Aadhaar User 9012",
      "date_of_birth": "15-08-1992",
      "gender": "Female",
      "address": "Flat 9012, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103, India",
      "masked_aadhaar": "XXXXXXXX9012"
    }
  }
  ```

### Verify PAN (Protected)
Uploads PAN card photo and extracts/validates details.
* **Method & Path**: `POST /kyc/pan/verify`
* **Request Payload (multipart/form-data)**:
  - `pan`: `ODZPS8086J` (text)
  - `panImage`: `[File]` (image file)
* **Success Response (200 OK)**:
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
Uploads GST certificate and validates GSTIN matching rules.
* **Method & Path**: `POST /kyc/gst/verify`
* **Request Payload (multipart/form-data)**:
  - `gstNumber`: `22AAAAA1111A1Z1` (text)
  - `gst`: `[File]` (document file)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "GST certificate verified successfully",
    "data": {
      "gstin": "22AAAAA1111A1Z1",
      "gstinMatch": true
    }
  }
  ```

### Upload Selfie (Protected)
Uploads the face capture photo.
* **Method & Path**: `POST /kyc/selfie`
* **Request Payload (multipart/form-data)**:
  - `selfie`: `[File]` (image file)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Selfie uploaded successfully",
    "filePath": "/uploads/selfie/selfie-1780384000.jpg",
    "pendingReview": true,
    "kycStatus": "pending_review"
  }
  ```

### Set Seller Type (Protected)
Allows setting individual/business category.
* **Method & Path**: `POST /kyc/seller-type`
* **Request Payload (JSON)**:
  ```json
  {
    "sellerType": "individual"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Seller type successfully updated to individual",
    "sellerType": "individual"
  }
  ```

### Check KYC Status (Protected)
Gets user KYC list verification checklist.
* **Method & Path**: `GET /kyc/status`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "sellerType": "individual",
    "isKycVerified": false,
    "kycStatus": "in_progress",
    "rejectionReason": null,
    "progress": {
      "completed": 2,
      "total": 3,
      "percentage": 67
    },
    "documents": {
      "aadhaar": "verified",
      "pan": "verified",
      "selfie": "pending"
    }
  }
  ```

### Reupload KYC (Protected)
Resets KYC statuses to clear previous uploads and restart document verification.
* **Method & Path**: `POST /kyc/reupload`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC reset. Please re-upload your documents.",
    "kycStatus": "in_progress"
  }
  ```

### Submit KYC (Protected)
Submits all uploaded files for administrative review.
* **Method & Path**: `POST /kyc/submit`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC documents submitted successfully",
    "kycStatus": "pending_review"
  }
  ```

---

## 4. Compliance Admin Endpoints

### Admin Login
* **Method & Path**: `POST /admin/login`
* **Request Payload (JSON)**:
  ```json
  {
    "email": "admin@loopozone.com",
    "password": "Admin@123456"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "expiresIn": 28800,
    "admin": {
      "_id": "6a1e85b54f545d9d...",
      "name": "Loopozone Admin",
      "email": "admin@loopozone.com",
      "role": "admin"
    }
  }
  ```

### Get Pending KYC
Retrieves users who have submitted all documents and are pending audit.
* **Method & Path**: `GET /admin/kyc/pending`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "users": [
      {
        "_id": "6a1e80e13316b9f5...",
        "name": "Kavya Madhavan",
        "email": "kavya@example.com",
        "phone": "+919876543210",
        "kycStatus": "pending_review",
        "selfieImage": "/uploads/selfie/selfie-178038.jpg"
      }
    ]
  }
  ```

### View User Documents
Retrieves full details and file paths for auditing.
* **Method & Path**: `GET /admin/kyc/user/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "phone": "+919876543210",
      "email": "kavya@example.com",
      "kycStatus": "pending_review",
      "sellerType": "individual",
      "username": "kavya",
      "password": "kavya_password_10",
      "documents": {
        "aadhaar": "XXXXXXXX9012",
        "pan": "/uploads/pan/pan-1780.png",
        "selfie": "/uploads/selfie/selfie-1780.jpg"
      }
    }
  }
  ```

### Approve KYC
* **Method & Path**: `POST /admin/kyc/approve/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC approved successfully",
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "email": "kavya@example.com",
      "phone": "+919876543210",
      "kycStatus": "approved",
      "isKycVerified": true,
      "username": "kavya",
      "password": "kavya_password_10",
      "aadhaarNumber": "XXXXXXXX9012",
      "panNumber": "ODZPS8086J"
    }
  }
  ```

### Reject KYC
* **Method & Path**: `POST /admin/kyc/reject/:userId`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "reason": "PAN card photo is blurry and unreadable."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC rejected",
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "phone": "+919876543210",
      "kycStatus": "rejected",
      "rejectionReason": "PAN card photo is blurry and unreadable."
    }
  }
  ```

### Create Admin Account
Create a new administrator account (requires existing admin authorization).
* **Method & Path**: `POST /admin/create`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "name": "Jane Smith",
    "email": "janesmith@loopozone.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Admin created",
    "admin": {
      "_id": "6a2001016a6a0c3515e38b6d",
      "name": "Jane Smith",
      "email": "janesmith@loopozone.com",
      "role": "admin"
    }
  }
  ```

---

## 5. User Profile & Dashboard

### Get Profile (Protected)
* **Method & Path**: `GET /user/profile`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a1e80e13316b9f5...",
      "name": "Kavya Madhavan",
      "email": "kavya@example.com",
      "phone": "+919876543210",
      "isKycVerified": true,
      "kycStatus": "approved"
    }
  }
  ```

### Get Dashboard Data (Protected & KYC-Gated)
Only accessible to approved/verified users.
* **Method & Path**: `GET /user/dashboard`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "dashboardData": {
      "sales": 14200,
      "orders": 12,
      "walletBalance": 8750
    }
  }
  ```

---

## 6. Prices & Categories CMS Endpoints

### Get Public Prices (No Auth)
* **Method & Path**: `GET /prices`
* **Query Parameters (Optional)**: `city` (e.g. `?city=mumbai`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "prices": [
      {
        "_id": "6a1fd205cf6b4094b436b086",
        "materialName": "Copper Wire",
        "pricePerKg": 450,
        "priceChange": 0,
        "city": "Mumbai",
        "updatedBy": {
          "_id": "6a1e85b54f545d9d088360dd",
          "name": "Loopozone Admin"
        }
      }
    ]
  }
  ```

### Get Public Categories (No Auth)
* **Method & Path**: `GET /categories`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 1,
    "categories": [
      {
        "_id": "6a1fc3ab895a59174f1b0767",
        "name": "E-Waste",
        "description": "Electronics, Batteries",
        "icon": "zap",
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
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Price record created successfully",
    "price": {
      "_id": "6a1fd205cf6b4094b436b086",
      "materialName": "Copper Wire",
      "pricePerKg": 450,
      "priceChange": 0,
      "city": "Mumbai",
      "updatedBy": "6a1e85b54f545d9d088360dd"
    }
  }
  ```

### Update Price Record (Admin Auth)
* **Method & Path**: `PUT /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "pricePerKg": 455
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Price record updated successfully",
    "price": {
      "_id": "6a1fd205cf6b4094b436b086",
      "materialName": "Copper Wire",
      "pricePerKg": 455,
      "priceChange": 5,
      "city": "Mumbai"
    }
  }
  ```

### Delete Price Record (Admin Auth)
* **Method & Path**: `DELETE /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
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
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "category": {
      "_id": "6a1fc3ab895a59174f1b0767",
      "name": "E-Waste",
      "description": "Electronics, Batteries",
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
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "category": {
      "_id": "6a1fc3ab895a59174f1b0767",
      "name": "E-Waste",
      "isActive": false
    }
  }
  ```

### Delete Category (Admin Auth)
* **Method & Path**: `DELETE /admin/categories/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```

---

## 7. Complete Endpoint Reference List

```text
/auth/check-user                 POST   – Check if phone number is registered
/auth/signup                     POST   – Register new profile & get temp JWT
/auth/send-otp                   POST   – Send login OTP (protected - requires JWT)
/auth/verify-otp                 POST   – Verify login OTP & retrieve access JWT
/auth/send-email-otp            POST   – Send OTP to email (protected)
/auth/verify-email-otp          POST   – Verify email OTP (protected)
/auth/refresh                    POST   – Refresh access token using refresh token
/auth/logout                     POST   – Logout and revoke refresh token (protected)

/kyc/aadhaar/send-otp          POST   – Trigger Aadhaar Send OTP
/kyc/aadhaar/verify-otp        POST   – Submit OTP for Aadhaar verification
/kyc/pan/verify                POST   – Upload PAN image & verify format (multipart)
/kyc/gst/verify                POST   – Upload GST document (multipart)
/kyc/selfie                    POST   – Upload selfie image (multipart)
/kyc/seller-type               POST   – Update individual/business seller type
/kyc/status                     GET    – Get document checklist status
/kyc/reupload                  POST   – Reset KYC state for document re-upload
/kyc/submit                    POST   – Finalize document uploads for admin review

/admin/login                    POST   – Compliance Admin authentication
/admin/kyc/pending              GET    – Retrieve pending KYC submissions
/admin/kyc/user/:userId         GET    – Retrieve user document paths for review
/admin/kyc/approve/:userId      POST   – Set KYC status to approved
/admin/kyc/reject/:userId       POST   – Set KYC status to rejected with reason
/admin/kyc/all                  GET    – Retrieve all users KYC registry list
/admin/create                   POST   – Create a new administrator account

/admin/prices                   POST   – Create price listing (Admin)
/admin/prices                   GET    – List all price listings (Admin)
/admin/prices/:id               PUT    – Update price listing details (Admin)
/admin/prices/:id               DELETE – Delete price listing (Admin)

/admin/categories               POST   – Create material category (Admin)
/admin/categories               GET    – List all material categories (Admin)
/admin/categories/:id           PUT    – Update material category details (Admin)
/admin/categories/:id           DELETE – Delete material category (Admin)

/prices                         GET    – Get public active prices listing
/categories                     GET    – Get public active categories listing

/user/profile                  GET    – Fetch user identity details
/user/dashboard                GET    – Fetch marketplace dashboard data (KYC Gated)
```
