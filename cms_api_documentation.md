# Loopozone CMS API Documentation — Prices & Categories

This document provides the complete API specifications, payload schemas, and JSON response structures for the **Material Categories** and **Live Indicative Prices** CMS modules.

---

## 1. Overview & Authentication

* **Base URL**: `http://localhost:3000`
* **Public Endpoints**: Accessible without authentication. Used by the consumer portal to show real-time market scrap rates.
* **Admin Endpoints**: Require a valid administrator JWT token passed in the headers:
  ```http
  Authorization: Bearer <ADMIN_JWT>
  ```

---

## 2. Endpoint Summary Reference

### Public Endpoints (No Authentication Required)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/prices` | Retrieve all live indicative scrap price listings. |
| **GET** | `/categories` | Retrieve all active material categories (filtered by `isActive: true`). |

### Admin Endpoints (Admin JWT Authorization Required)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/admin/prices` | Retrieve all price records (including creator details). |
| **POST** | `/admin/prices` | Create a new indicative material price record. |
| **PUT** | `/admin/prices/:id` | Update a price record (automatically computes price trend changes). |
| **DELETE** | `/admin/prices/:id` | Delete a price record from the database. |
| **GET** | `/admin/categories` | Retrieve all categories (both active and inactive). |
| **POST** | `/admin/categories` | Create a new material category (validates unique name). |
| **PUT** | `/admin/categories/:id` | Update category details (name, icon, status, description). |
| **DELETE** | `/admin/categories/:id` | Delete a category from the database. |

---

## 3. Public API Details

### Get Live Prices
* **Method & Path**: `GET /prices`
* **Query Parameters (Optional)**:
  - `city`: Filter prices by city (case-insensitive, e.g. `?city=mumbai`)
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "prices": [
      {
        "_id": "6a1fd205cf6b4094b436b084",
        "materialName": "Pet Bottles",
        "pricePerKg": 24,
        "priceChange": 0.5,
        "city": "Mumbai",
        "updatedBy": {
          "_id": "6a1e85b54f545d9d088360dd",
          "name": "Loopozone Admin",
          "email": "admin@loopozone.com"
        },
        "createdAt": "2026-06-03T07:04:37.771Z",
        "updatedAt": "2026-06-03T07:15:30.120Z"
      },
      {
        "_id": "6a1fd205cf6b4094b436b085",
        "materialName": "Iron Scrap",
        "pricePerKg": 32,
        "priceChange": -0.5,
        "city": "Mumbai",
        "updatedBy": {
          "_id": "6a1e85b54f545d9d088360dd",
          "name": "Loopozone Admin"
        },
        "createdAt": "2026-06-03T07:04:37.771Z",
        "updatedAt": "2026-06-03T07:15:30.120Z"
      }
    ]
  }
  ```

### Get Active Categories
* **Method & Path**: `GET /categories`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 2,
    "categories": [
      {
        "_id": "6a1fc3ab895a59174f1b0765",
        "name": "Plastic",
        "description": "PET, HDPE, PVC",
        "icon": "droplet",
        "isActive": true,
        "createdAt": "2026-06-03T07:04:37.520Z",
        "updatedAt": "2026-06-03T07:04:37.520Z"
      },
      {
        "_id": "6a1fc3ab895a59174f1b0766",
        "name": "Paper",
        "description": "Cardboard, Mix Paper",
        "icon": "package",
        "isActive": true,
        "createdAt": "2026-06-03T07:04:37.520Z",
        "updatedAt": "2026-06-03T07:04:37.520Z"
      }
    ]
  }
  ```

---

## 4. Admin Prices API Details

### Fetch All Price Records
* **Method & Path**: `GET /admin/prices`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**: (Same structure as `GET /prices` but returns all compiled prices regardless of city).

### Create Price Record
* **Method & Path**: `POST /admin/prices`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  ```json
  {
    "materialName": "Copper Wire",
    "pricePerKg": 450,
    "city": "Mumbai",
    "priceChange": 0
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Price record created successfully",
    "price": {
      "materialName": "Copper Wire",
      "pricePerKg": 450,
      "priceChange": 0,
      "city": "Mumbai",
      "updatedBy": "6a1e85b54f545d9d088360dd",
      "_id": "6a1fd205cf6b4094b436b086",
      "createdAt": "2026-06-03T09:15:30.000Z",
      "updatedAt": "2026-06-03T09:15:30.000Z"
    }
  }
  ```

### Update Price Record
* **Method & Path**: `PUT /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Request Payload (JSON)**:
  *(Supports updating any field. Updating `pricePerKg` automatically recalculates and sets the `priceChange` value relative to the previous price).*
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
      "city": "Mumbai",
      "updatedBy": "6a1e85b54f545d9d088360dd",
      "createdAt": "2026-06-03T09:15:30.000Z",
      "updatedAt": "2026-06-03T09:20:00.000Z"
    }
  }
  ```

### Delete Price Record
* **Method & Path**: `DELETE /admin/prices/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Price record deleted successfully"
  }
  ```

---

## 5. Admin Categories API Details

### Fetch All Categories
* **Method & Path**: `GET /admin/categories`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**: Returns both active and inactive categories.

### Create Category
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
      "name": "E-Waste",
      "description": "Electronics, Batteries",
      "icon": "zap",
      "isActive": true,
      "_id": "6a1fc3ab895a59174f1b0767",
      "createdAt": "2026-06-03T09:22:00.000Z",
      "updatedAt": "2026-06-03T09:22:00.000Z"
    }
  }
  ```

### Update Category
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
      "description": "Electronics, Batteries",
      "icon": "zap",
      "isActive": false,
      "createdAt": "2026-06-03T09:22:00.000Z",
      "updatedAt": "2026-06-03T09:25:00.000Z"
    }
  }
  ```

### Delete Category
* **Method & Path**: `DELETE /admin/categories/:id`
* **Headers**: `Authorization: Bearer <ADMIN_JWT>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Category deleted successfully"
  }
  ```
