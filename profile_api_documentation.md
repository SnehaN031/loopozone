# Profile & Wallet API Documentation

This document describes the Profile Dashboard, Settings, and Wallet endpoints mounted at `/user` for the Loopozone Marketplace platform. All requests require authentication using a valid user JWT token.

## Base URL
* **Localhost**: `http://localhost:5000`
* **DevTunnel URL**: `https://pqdjx1xh-5000.inc1.devtunnels.ms`

---

## Endpoint Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/user/profile` | Retrieve profile settings, orders summary, wallet, ratings, and activity log. |
| **POST** | `/user/switch-role` | Toggle the active profile role between `'buyer'` and `'seller'`. |
| **PUT** | `/user/profile` | Update profile preferences (language, saved addresses, etc.). |
| **PUT** | `/user/notifications/preferences` | Update toggles for email, SMS, push, order, and wallet notifications. |
| **POST** | `/user/wallet/add-money` | Add funds to user's wallet balance. |
| **POST** | `/user/wallet/withdraw` | Withdraw funds from user's wallet to bank account. |

---

## 1. Fetch Profile details
Retrieve current user's profile details, statistics cards values, wallet balance, ratings distribution, and recent activity timeline.

* **Method**: `GET`
* **Path**: `/user/profile`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
* **Request Body**: None (Keep as `none` in Postman)
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "6a22c709f83d3c57746c63dc",
      "name": "Suma M K",
      "email": "sumamk826@gmail.com",
      "phone": "+919380439359",
      "role": "seller",
      "membershipType": "Standard Member",
      "sellerLevel": "Bronze Seller",
      "wallet": {
        "balance": 0,
        "totalEarnings": 0,
        "withdrawnAmount": 0,
        "pendingSettlement": 0
      },
      "ordersSummary": {
        "total": 0,
        "pending": 0,
        "processing": 0,
        "completed": 0,
        "cancelled": 0
      },
      "ratingsSummary": {
        "averageRating": 4.8,
        "totalReviews": 0,
        "distribution": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 }
      },
      "recentActivity": [
        {
          "title": "Welcome to Loopozone!",
          "description": "Thank you for signing up. Please verify your KYC documents to get started.",
          "timestamp": "2026-06-05T12:54:34.742Z"
        }
      ],
      "savedAddresses": [],
      "languagePreference": "English",
      "isKycVerified": false,
      "kycStatus": "pending"
    }
  }
  ```

---

## 2. Switch Role (Buyer ⇄ Seller)
Toggles the current acting role of the user (e.g. from `'seller'` to `'buyer'`).

* **Method**: `POST`
* **Path**: `/user/switch-role`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
* **Request Body**: None (Keep as `none` in Postman)
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Role switched successfully to buyer",
    "role": "buyer",
    "recentActivity": [
      {
        "title": "Role Switched",
        "description": "Successfully switched role from seller to buyer.",
        "timestamp": "2026-06-05T12:54:34.742Z"
      }
    ]
  }
  ```

---

## 3. Update Profile Preferences
Updates user-specific preferences such as language and saved addresses list.

* **Method**: `PUT`
* **Path**: `/user/profile`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body**:
  ```json
  {
    "languagePreference": "Hindi",
    "savedAddresses": [
      {
        "title": "Home Address",
        "addressLine": "Flat 8787, Green Glen Layout, Bellandur",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560103"
      }
    ]
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "user": { ... }
  }
  ```

---

## 4. Update Notification Preferences
Toggle toggles for the user's notification preferences.

* **Method**: `PUT`
* **Path**: `/user/notifications/preferences`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body**:
  ```json
  {
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true,
    "orderUpdates": true,
    "walletUpdates": true,
    "promotionalUpdates": false
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Notification preferences updated successfully",
    "notificationPreferences": { ... }
  }
  ```

---

## 5. Add Wallet Funds (Deposit)
Add money to the user's wallet balance.

* **Method**: `POST`
* **Path**: `/user/wallet/add-money`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body**:
  ```json
  {
    "amount": 1000
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Successfully deposited ₹1000",
    "wallet": {
      "balance": 1000,
      "totalEarnings": 1000,
      "withdrawnAmount": 0,
      "pendingSettlement": 0
    },
    "recentActivity": [...]
  }
  ```

---

## 6. Withdraw Wallet Funds
Withdraw money from the user's wallet balance (simulates transaction to bank details).

* **Method**: `POST`
* **Path**: `/user/wallet/withdraw`
* **Headers**:
  * `Authorization`: `Bearer <USER_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Request Body**:
  ```json
  {
    "amount": 400
  }
  ```
* **Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Successfully withdrew ₹400",
    "wallet": {
      "balance": 600,
      "totalEarnings": 1000,
      "withdrawnAmount": 400,
      "pendingSettlement": 0
    },
    "recentActivity": [...]
  }
  ```
