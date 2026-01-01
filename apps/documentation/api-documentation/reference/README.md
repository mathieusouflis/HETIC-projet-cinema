---
description: >-
  Complete API reference documentation for all Cinema API endpoints,
  authentication, and error codes
---

# 📖 API Reference Overview

This section provides comprehensive documentation for all Cinema API endpoints, including authentication methods, request/response formats, and error handling.

## 🌐 Base Information

### Base URL

```
Production:  https://api.cinema.com/v1
Development: http://localhost:3000/api/v1
```

### Content Type

All requests and responses use JSON format:

```
Content-Type: application/json
```

### API Version

Current version: **v1**

All endpoints are prefixed with `/api/v1`

## 🔐 Authentication

The Cinema API uses **JWT (JSON Web Tokens)** for authentication with a dual-token system:

### Token Types

* **Access Token** - Short-lived (15 minutes), used for API requests
* **Refresh Token** - Long-lived (7 days), used to obtain new access tokens

### Authentication Header

Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    
    Client->>API: POST /auth/login
    API->>Client: {accessToken, refreshToken}
    
    Client->>API: GET /users/me (with accessToken)
    API->>Client: User data
    
    Note over Client: Access token expires
    
    Client->>API: POST /auth/refresh (with refreshToken)
    API->>Client: {newAccessToken, newRefreshToken}
```

## 📋 Endpoint Overview

### Authentication Endpoints

| Method | Endpoint         | Description        | Auth Required |
| ------ | ---------------- | ------------------ | ------------- |
| POST   | `/auth/register` | Create new account | No            |
| POST   | `/auth/login`    | Authenticate user  | No            |
| POST   | `/auth/refresh`  | Refresh tokens     | No\*          |
| POST   | `/auth/logout`   | Logout user        | Yes           |
| GET    | `/auth/me`       | Current user info  | Yes           |

\*Requires valid refresh token in body

### User Management Endpoints

| Method | Endpoint     | Description            | Auth Required |
| ------ | ------------ | ---------------------- | ------------- |
| GET    | `/users`     | List users (paginated) | Yes           |
| GET    | `/users/me`  | Current user profile   | Yes           |
| PATCH  | `/users/me`  | Update own profile     | Yes           |
| GET    | `/users/:id` | Get user by ID         | No            |
| PATCH  | `/users/:id` | Update user            | Owner only    |
| DELETE | `/users/:id` | Delete user            | Owner only    |

## 🔑 Authentication Endpoints

### Register User

Create a new user account.

**`POST /auth/register`**

#### Request Body

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

#### Validation Rules

* **email**: Valid email format, max 255 characters, unique
* **username**: 3-30 characters, alphanumeric + underscore/hyphen, unique
* **password**: Min 8 characters, must contain uppercase, lowercase, and number

#### Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Error Responses

```json
// 400 - Validation Error
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    }
  ]
}

// 409 - Email Already Exists
{
  "success": false,
  "error": "A user with email \"user@example.com\" already exists"
}
```

### Login User

Authenticate an existing user.

**`POST /auth/login`**

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "user@example.com",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Error Responses

```json
// 401 - Invalid Credentials
{
  "success": false,
  "error": "Invalid email or password"
}
```

### Refresh Tokens

Get new access and refresh tokens.

**`POST /auth/refresh`**

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

```json
// 401 - Invalid Refresh Token
{
  "success": false,
  "error": "Invalid or expired refresh token"
}
```

### Logout User

Logout the current user (client-side token removal).

**`POST /auth/logout`**

#### Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Current User Info

Get basic info from JWT token.

**`GET /auth/me`**

#### Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "userId": "1",
    "email": "user@example.com"
  }
}
```

## 👥 User Management Endpoints

### List Users

Get paginated list of users.

**`GET /users`**

#### Headers

```
Authorization: Bearer <access_token>
```

#### Query Parameters

| Parameter | Type    | Default | Description                       |
| --------- | ------- | ------- | --------------------------------- |
| `page`    | integer | 1       | Page number (min: 1)              |
| `limit`   | integer | 10      | Items per page (min: 1, max: 100) |

#### Example Request

```
GET /users?page=1&limit=20
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "1",
        "email": "user1@example.com",
        "username": "user1",
        "avatar": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "2", 
        "email": "user2@example.com",
        "username": "user2",
        "avatar": "https://example.com/avatar.jpg",
        "createdAt": "2024-01-02T00:00:00.000Z",
        "updatedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 42,
      "totalPages": 3
    }
  }
}
```

### Get Current User Profile

Get full profile of the authenticated user.

**`GET /users/me`**

#### Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@example.com",
    "username": "johndoe",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Current User Profile

Update the authenticated user's profile.

**`PATCH /users/me`**

#### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Request Body

```json
{
  "username": "newusername",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Validation Rules

* **username** (optional): 3-30 characters, alphanumeric + underscore/hyphen, unique
* **avatar** (optional): Valid URL or null to remove

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@example.com",
    "username": "newusername",
    "avatar": "https://example.com/new-avatar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:30:00.000Z"
  }
}
```

### Get User by ID

Get public profile of any user.

**`GET /users/:id`**

#### Path Parameters

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | User ID     |

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@example.com",
    "username": "johndoe",
    "avatar": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Error Responses

```json
// 404 - User Not Found
{
  "success": false,
  "error": "User with identifier \"999\" not found"
}
```

### Update User by ID

Update a user's profile (owner only).

**`PATCH /users/:id`**

#### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Path Parameters

| Parameter | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `id`      | string | User ID (must match authenticated user) |

#### Request Body

```json
{
  "username": "newusername",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Response (200 OK)

Same as `PATCH /users/me`

#### Error Responses

```json
// 401 - Not Owner
{
  "success": false,
  "error": "You can only access your own resources"
}
```

### Delete User

Delete a user account (owner only).

**`DELETE /users/:id`**

#### Headers

```
Authorization: Bearer <access_token>
```

#### Path Parameters

| Parameter | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `id`      | string | User ID (must match authenticated user) |

#### Response (204 No Content)

Empty response body.

## 📊 Response Format

### Success Response Structure

```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data
  }
}
```

### Error Response Structure

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Optional validation details
    {
      "field": "fieldName",
      "message": "Field-specific error message",
      "code": "error_code"
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

## ❌ Error Codes

### HTTP Status Codes

| Status | Code                  | Description                    | Example                    |
| ------ | --------------------- | ------------------------------ | -------------------------- |
| 200    | OK                    | Request successful             | User data retrieved        |
| 201    | Created               | Resource created               | User registered            |
| 204    | No Content            | Success, no response body      | User deleted               |
| 400    | Bad Request           | Invalid input data             | Validation failed          |
| 401    | Unauthorized          | Authentication required/failed | Invalid token              |
| 403    | Forbidden             | Access denied                  | Not resource owner         |
| 404    | Not Found             | Resource not found             | User doesn't exist         |
| 409    | Conflict              | Resource conflict              | Email already exists       |
| 500    | Internal Server Error | Server error                   | Database connection failed |

### Common Error Types

#### Validation Errors (400)

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters",
      "code": "too_small"
    }
  ]
}
```

#### Authentication Errors (401)

```json
{
  "success": false,
  "error": "Invalid token"
}
```

#### Authorization Errors (403)

```json
{
  "success": false,
  "error": "You can only access your own resources"
}
```

#### Not Found Errors (404)

```json
{
  "success": false,
  "error": "User with identifier \"123\" not found"
}
```

#### Conflict Errors (409)

```json
{
  "success": false,
  "error": "A user with email \"user@example.com\" already exists"
}
```

## 🔒 Security Considerations

### Rate Limiting

* **Authentication endpoints**: 5 requests per minute per IP
* **General endpoints**: 100 requests per minute per authenticated user
* **Public endpoints**: 50 requests per minute per IP

### Token Security

* **Access tokens** expire after 15 minutes
* **Refresh tokens** expire after 7 days
* Tokens are invalidated after password change
* Use HTTPS in production

### Input Validation

* All inputs are validated using Zod schemas
* SQL injection protection via parameterized queries
* XSS protection through input sanitization

## 📝 Examples

### Complete Authentication Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "johndoe",
    "password": "SecurePass123"
  }'

# Response includes accessToken and refreshToken

# 2. Use access token for authenticated requests
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Refresh token when access token expires
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

### User Management Flow

```bash
# Get current user profile
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"

# Update profile
curl -X PATCH http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "avatar": "https://example.com/avatar.jpg"
  }'

# List all users (paginated)
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

## 🔗 Related Documentation

* [**Authentication Guide**](../../api/reference/authentication.md) - Detailed authentication implementation
* [**Error Handling Guide**](../../api/guides/error-handling.md) - Error handling patterns
* [**Quick Start**](../guides/quick-start.md) - Get started quickly
* [**Examples**](/broken/pages/SKW7YUUEqmIti47kic96) - More code examples

## 📞 Support

For API support:

* Check this documentation first
* Review the [examples](/broken/pages/SKW7YUUEqmIti47kic96)
* Report issues in the project repository
* Ask questions in project discussions
