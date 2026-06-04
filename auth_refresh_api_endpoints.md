# Loopozone Authentication & Refresh Token API Specifications

This document outlines the API specifications for the short-lived access token and long-lived refresh token session management flow.

* **Base URL**: `https://pqdjx1xh-5000.inc1.devtunnels.ms`

---

## 1. Signup / Register Account
Creates a new user account and returns both the initial access token and refresh token.

* **Endpoint**: `POST /auth/signup`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+919876543210"
  }
  ```
* **Response Body (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Signup successful",
    "token": "eyJhbGciOi...",        // Access Token (Expires in 15 minutes)
    "refreshToken": "eyJhbGciOi...", // Refresh Token (Expires in 7 days)
    "user": {
      "_id": "6a2153f3530c40936639faf7",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```

---

## 2. Phone OTP Login Verification
Verifies the 6-digit OTP code and logs the user in, returning a new session.

* **Endpoint**: `POST /auth/verify-otp`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "phone": "+919876543210",
    "otp": "123456"
  }
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",        // Access Token (Expires in 15 minutes)
    "refreshToken": "eyJhbGciOi...", // Refresh Token (Expires in 7 days)
    "user": {
      "_id": "6a2153f3530c40936639faf7",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+919876543210",
      "isEmailVerified": false,
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```

---

## 3. Refresh Access Token
Request a new short-lived access token using a valid, non-expired refresh token.

* **Endpoint**: `POST /auth/refresh`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "refreshToken": "<YOUR_CURRENT_REFRESH_TOKEN>"
  }
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "token": "<NEW_ACCESS_TOKEN>",       // New Access Token (Expires in 15 mins)
    "refreshToken": "<NEW_REFRESH_TOKEN>" // New rotated Refresh Token (Old token invalidated)
  }
  ```
* **Error Response (`401 Unauthorized`)**:
  ```json
  {
    "success": false,
    "error": "Invalid or expired refresh token"
  }
  ```

---

## 4. Logout / Revoke Session
Invalidates the current session by removing the refresh token from the database.

* **Endpoint**: `POST /auth/logout`
* **Headers**:
  * `Authorization: Bearer <ACCESS_TOKEN>`
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "refreshToken": "<YOUR_CURRENT_REFRESH_TOKEN>"
  }
  ```
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
