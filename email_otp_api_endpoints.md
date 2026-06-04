# Loopozone Email OTP Verification API Specifications

This document outlines the API specifications for generating, sending, and verifying Email OTP codes.

* **Base URL**: `https://pqdjx1xh-5000.inc1.devtunnels.ms`

---

## 1. Send Email OTP
Generates a 6-digit OTP code and logs it on the server (or emails it in production) for the authenticated user.

* **Endpoint**: `POST /auth/send-email-otp`
* **Headers**:
  * `Authorization: Bearer <ACCESS_TOKEN>`
* **Request Body**: None (Leave empty, the backend reads the email address directly from the authenticated user's profile associated with the JWT).
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Email OTP sent successfully"
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": "Invalid or expired token."
  }
  ```

---

## 2. Verify Email OTP
Verifies the submitted 6-digit email OTP.

* **Endpoint**: `POST /auth/verify-email-otp`
* **Headers**:
  * `Authorization: Bearer <ACCESS_TOKEN>`
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "otp": "654321"
  }
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully",
    "user": {
      "_id": "6a2153f3530c40936639faf7",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "isEmailVerified": true,
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```
* **Error Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "error": "Invalid or expired OTP"
  }
  ```

---

## Development Mode Bypass
To simplify local testing, the backend contains a developer bypass for the email verification check:
* If `NODE_ENV` is set to `development` (non-production), you can verify any email address using the static codes: **`654321`** or **`123456`** without needing to look up the generated code in the server terminal logs.
