# Loopozone KYC & Admin API Documentation

This document lists all the API endpoints used for **KYC Document Processing** and **Compliance Admin Auditing** inside the Loopozone platform service.

---

## Base Configuration
* **Server URL**: `http://localhost:5000`
* **Static File Path**: `/uploads` (e.g., `http://localhost:5000/uploads/pan/...`)
* **Authentication**: All protected routes require a `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Compliance Admin Endpoints (`/admin`)

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/admin/login` | Public | Admin login. Returns an admin JWT. |
| **GET** | `/admin/kyc/pending` | Admin JWT | List all user KYC submissions awaiting review. |
| **GET** | `/admin/kyc/user/:userId` | Admin JWT | View documents and identity details of a specific user. |
| **POST** | `/admin/kyc/approve/:userId` | Admin JWT | Approve user KYC (updates status to `approved`). |
| **POST** | `/admin/kyc/reject/:userId` | Admin JWT | Reject user KYC with a reason (min 10 characters). |
| **GET** | `/admin/kyc/all` | Admin JWT | List all KYC records (approved, pending, and rejected). |
| **POST** | `/admin/create` | Admin JWT | Create a new administrator account. |

### Admin API Payloads & Responses

#### Admin Login
* **Endpoint**: `POST /admin/login`
* **Request Payload**:
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
      "_id": "6a1e85b54f545d9...",
      "name": "Loopozone Admin",
      "email": "admin@loopozone.com",
      "role": "admin"
    }
  }
  ```

#### Reject KYC
* **Endpoint**: `POST /admin/kyc/reject/:userId`
* **Request Payload**:
  ```json
  {
    "reason": "PAN card photo is blurry and illegible."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "KYC rejected",
    "user": {
      "kycStatus": "rejected",
      "rejectionReason": "PAN card photo is blurry and illegible."
    }
  }
  ```

---

## 2. KYC Onboarding Endpoints (`/kyc`)

All endpoints in this section are protected by the consumer user JWT.

| Method | Endpoint | Payload Format | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/kyc/aadhaar/send-otp` | JSON | Send verification OTP to Aadhaar-registered phone. |
| **POST** | `/kyc/aadhaar/verify-otp` | JSON | Verify Aadhaar OTP and retrieve profile details. |
| **POST** | `/kyc/pan/verify` | multipart/form-data | Upload PAN card photo and run OCR format matching. |
| **POST** | `/kyc/gst/verify` | multipart/form-data | Upload GST certificate (for Business seller profiles). |
| **POST** | `/kyc/selfie` | multipart/form-data | Upload selfie photo for face verification matching. |
| **POST** | `/kyc/seller-type` | JSON | Select account category: `'individual'` or `'business'`. |
| **GET** | `/kyc/status` | None | Retrieve user's upload checklist status and progress. |
| **POST** | `/kyc/reupload` | None | Reset KYC progress to re-upload documents after a rejection. |
| **POST** | `/kyc/submit` | None | Finalize document uploads and submit for Admin review. |

### KYC API Payloads & Responses

#### Send Aadhaar OTP
* **Endpoint**: `POST /kyc/aadhaar/send-otp`
* **Request Payload**:
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

#### Verify Aadhaar OTP
* **Endpoint**: `POST /kyc/aadhaar/verify-otp`
* **Request Payload**:
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

#### Verify PAN Card
* **Endpoint**: `POST /kyc/pan/verify`
* **Request Payload (multipart/form-data)**:
  - `pan`: `ABCDE1234F` (text)
  - `panImage`: `[File]` (image upload)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "PAN card verified successfully",
    "data": {
      "pan": "ABCDE1234F"
    }
  }
  ```

#### Verify GST Certificate
* **Endpoint**: `POST /kyc/gst/verify`
* **Request Payload (multipart/form-data)**:
  - `gstNumber`: `29ABCDE1234F1Z5` (text)
  - `gst`: `[File]` (document upload)
* **Success Response (200 OK)**:
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

#### Upload Selfie
* **Endpoint**: `POST /kyc/selfie`
* **Request Payload (multipart/form-data)**:
  - `selfie`: `[File]` (image capture)
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

#### Check KYC Checklist Status
* **Endpoint**: `GET /kyc/status`
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
