# API Documentation

**Base URL:** `{API_URL}/api/v1/`

**Language Support:** Pass `?lang=ar` query param, `X-Language: ar` header, or `Accept-Language: ar` header for Arabic translations.

---

## Authentication

**JWT Token:** Passed via `Authorization: Bearer <token>` header.
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days

**Token shape (decoded):**
```json
{
  "userId": "string",
  "isAdmin": boolean,
  "role": { "_id": "string", "name": "string", "permissions": ["string"] }
}
```

---

## Global Error Responses

| Status | Condition | Body |
|--------|-----------|------|
| 401 | Invalid/expired JWT | `{ "message": "not authorized" }` |
| 401 | Missing auth (permission middleware) | `{ "message": "authentication required" }` |
| 403 | Insufficient permissions | `{ "message": "insufficient permissions" }` |
| 403 | Not owner / not admin | `{ "message": "not allowed" }` |
| 404 | Invalid ObjectId (Mongoose CastError) | `{ "message": "resource not found" }` |
| 422 | Mongoose ValidationError | `{ "message": "<error details>" }` |
| 500 | Server error | `{ "message": "server error" }` |

---

## Localized Fields

Fields marked `localized` accept either:
- A plain string: `"Hello"` → stored as `{ en: "Hello", ar: "" }`
- An object: `{ en: "Hello", ar: "مرحبا" }`

---

# 1. Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/refresh` | None | Refresh access token |
| POST | `/auth/logout` | None | Revoke refresh token |

### POST `/auth/refresh`
**Body:**
```json
{ "refreshToken": "string (required)" }
```
**Response 200:**
```json
{ "accessToken": "string", "refreshToken": "string" }
```
**Errors:**
- `400` — `{ "message": "refreshToken is required" }`
- `401` — `{ "message": "invalid or expired refresh token" }`
- `401` — `{ "message": "refresh token not found" }`
- `401` — `{ "message": "refresh token expired" }`

### POST `/auth/logout`
**Body:**
```json
{ "refreshToken": "string (optional)" }
```
**Response 200:**
```json
{ "message": "logged out" }
```

---

# 2. Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/register` | None | Register new user |
| POST | `/users/login` | None | Login |
| POST | `/users/forgot-password` | None | Send reset email |
| POST | `/users/reset-password` | None | Reset password with token |
| POST | `/users/verify-email` | None | Verify email with OTP |
| POST | `/users/resend-verification` | None | Resend OTP |
| GET | `/users/profile` | Owner | Get own profile |
| PUT | `/users/profile` | Owner | Update own profile |
| GET | `/users/` | Admin | List all users |
| GET | `/users/:id` | Owner/Admin | Get user by ID |
| PUT | `/users/:id` | Owner/Admin | Update user by ID |
| DELETE | `/users/:id` | JWT | Delete user by ID |
| DELETE | `/users/` | JWT | Bulk delete users |
| GET | `/users/get/count` | JWT | User count |

### POST `/users/register`
**Body:**
```json
{
  "name": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "phone": "string (required)",
  "phoneDialCode": "string (optional)",
  "street": "string (optional)"
}
```
**Response 200:**
```json
{ "message": "Registration successful. Please check your email for verification code.", "userId": "string" }
```
**Errors:**
- `404` — `{ "message": "wasnt created" }`

### POST `/users/login`
**Body:**
```json
{ "email": "string (required)", "password": "string (required)" }
```
**Response 200:**
```json
{ "user": "email", "token": "string", "refreshToken": "string", "userId": "string" }
```
**Errors:**
- `400` — `{ "success": false, "message": "user is not found" }`
- `402` — `{ "success": false, "message": "password is wrong" }`
- `403` — `{ "success": false, "message": "Email not verified. A new verification code has been sent to your email.", "userId": "string", "isVerified": false }`

### POST `/users/forgot-password`
**Body:** `{ "email": "string (required)" }`
**Response 200:** `{ "message": "Reset link sent to email" }`
**Errors:** `404` — `{ "message": "User not found" }`

### POST `/users/reset-password`
**Body:** `{ "token": "string (required)", "newPassword": "string (required)" }`
**Response 200:** `{ "message": "Password updated successfully" }`
**Errors:**
- `400` — `{ "message": "Invalid token purpose" }`
- `400` — `{ "message": "Invalid or expired token" }`

### POST `/users/verify-email`
**Body:** `{ "userId": "string (required)", "code": "string (required)" }`
**Response 200:** `{ "message": "Email verified successfully" }`
**Errors:**
- `400` — `{ "message": "userId and code are required" }`
- `400` — `{ "message": "No verification code found. Please request a new one." }`
- `400` — `{ "message": "Verification code expired. Please request a new one." }`
- `400` — `{ "message": "Invalid verification code" }`
- `200` — `{ "message": "Email already verified" }`
- `404` — `{ "message": "User not found" }`

### POST `/users/resend-verification`
**Body:** `{ "email": "string (required)" }`
**Response 200:** `{ "message": "Verification code sent to email" }`
**Errors:**
- `400` — `{ "message": "Email is required" }`
- `200` — `{ "message": "Email already verified" }`
- `404` — `{ "message": "User not found" }`

### GET `/users/profile`
**Response 200:** User object (without `password`)
```json
{
  "_id": "string", "name": "string", "email": "string", "phone": "string",
  "phoneDialCode": "string", "street": "string", "apartment": "string",
  "city": "string", "zip": "string", "country": "string",
  "isAdmin": false, "role": "ObjectId", "twoFactorEnabled": false,
  "isVerified": true, "wishlist": ["ObjectId"], "id": "string"
}
```

### PUT `/users/profile`
**Body (all optional):**
```json
{
  "name": "string", "email": "string", "phone": "string", "phoneDialCode": "string",
  "street": "string", "apartment": "string", "city": "string", "zip": "string",
  "country": "string", "password": "string"
}
```
**Response 200:** Updated user object

### GET `/users/`
**Response 200:** Array of user objects (without `password`)

### GET `/users/:id`
**Response 200:** User object
**Errors:** `404` — `"not found"` (string)

### PUT `/users/:id`
**Body (all optional):**
```json
{
  "name": "string", "email": "string", "password": "string", "phone": "string",
  "phoneDialCode": "string", "street": "string", "apartment": "string",
  "city": "string", "zip": "string", "country": "string", "isAdmin": "boolean"
}
```
**Response 200:** Updated user object
**Errors:**
- `404` — `{ "message": "user not found" }`
- `400` — `"user not found"` (string)

### DELETE `/users/:id`
**Response 200:** Deleted user object
**Errors:**
- `404` — `{ "success": false, "message": "invalid user id" }`
- `404` — `{ "success": false, "message": "user not found" }`

### DELETE `/users/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "success": true, "message": "3 users deleted" }`
**Errors:** `400` — `{ "success": false, "message": "ids array is required" }`

### GET `/users/get/count`
**Response 200:** `{ "userCount": 42 }`

---

# 3. Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/` | None | List all (with filters) |
| GET | `/products/:id` | None | Get by ID |
| POST | `/products/` | products:create | Create product |
| PUT | `/products/:id` | products:update | Update product |
| PUT | `/products/gallery-images/:id` | products:update | Replace gallery images |
| DELETE | `/products/:id` | products:delete | Delete product |
| DELETE | `/products/` | products:delete | Bulk delete |
| GET | `/products/get/count` | None | Product count |
| GET | `/products/get/featured/:count` | None | Featured products |

### GET `/products/`
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `minPrice` | number | Min price filter |
| `maxPrice` | number | Max price filter |
| `color` | string | Exact color match |
| `categories` | string | Category ObjectId |
| `name` | string | Case-insensitive regex on name |
| `category` | string | Case-insensitive regex on category name |

**Response 200:** Array of product objects with populated `category`

### GET `/products/:id`
**Response 200:** Product object with populated `category`
**Errors:** `401` — `"not found"` (string)

### POST `/products/`
**Body:**
```json
{
  "name": "string | { en, ar } (localized, required)",
  "description": "string | { en, ar } (localized, required)",
  "richDescription": "string | { en, ar } (localized, optional)",
  "brand": "string | { en, ar } (localized, optional)",
  "color": "string (optional)",
  "price": "number (required)",
  "category": "ObjectId string (required)",
  "countInStock": "number (optional)",
  "isFeatured": "boolean (optional)",
  "image": { "url": "string", "publicId": "string" }
}
```
**Response 200:** Created product object
**Errors:**
- `400` — `"Invalid Category"` (string)
- `402` — `{ "success": false, "message": "product wasn't created" }`

### PUT `/products/:id`
**Body (all optional):**
```json
{
  "name": "string | { en, ar }", "description": "string | { en, ar }",
  "richDescription": "string | { en, ar }", "brand": "string | { en, ar }",
  "color": "string", "price": "number", "category": "ObjectId string",
  "countInStock": "number", "rating": "number", "numReviews": "number",
  "isFeatured": "boolean",
  "image": { "url": "string", "publicId": "string" }
}
```
**Response 200:** Updated product object
**Errors:**
- `404` — `{ "success": false, "message": "invalid product id" }`
- `400` — `"Invalid Category"` (string)
- `400` — `"Invalid Product!"` (string)
- `404` — `{ "success": false, "message": "product not found" }`

### PUT `/products/gallery-images/:id`
**Body:**
```json
{ "images": [{ "url": "string", "publicId": "string" }] }
```
**Response 200:** Updated product object
**Errors:**
- `404` — `{ "success": false, "message": "invalid product id" }`
- `404` — `{ "success": false, "message": "product not found" }`

### DELETE `/products/:id`
**Response 200:** Deleted product object
**Errors:**
- `404` — `{ "success": false, "message": "invalid product id" }`
- `404` — `{ "message": "product not found" }`

### DELETE `/products/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "success": true, "message": "3 products deleted" }`
**Errors:** `400` — `{ "success": false, "message": "ids array is required" }`

### GET `/products/get/count`
**Response 200:** `{ "productCount": 150 }`

### GET `/products/get/featured/:count`
**Response 200:** Array of featured product objects, limited to `count`

---

# 4. Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories/` | None | List all |
| GET | `/categories/:id` | None | Get by ID |
| POST | `/categories/` | categories:create | Create |
| PUT | `/categories/:id` | categories:update | Update |
| DELETE | `/categories/:id` | categories:delete | Delete |
| DELETE | `/categories/` | categories:delete | Bulk delete |

### GET `/categories/`
**Response 200:** Array of category objects

### GET `/categories/:id`
**Response 200:** Category object
**Errors:** `404` — `{ "success": false, "message": "category not found" }`

### POST `/categories/`
**Body:**
```json
{
  "name": "string | { en, ar } (localized, required)",
  "icon": "string (optional)",
  "color": "string (optional)",
  "image": { "url": "string", "publicId": "string" }
}
```
**Response 200:** Created category object
**Errors:** `500` — `"category cannot be created"` (string)

### PUT `/categories/:id`
**Body (all optional):**
```json
{
  "name": "string | { en, ar }", "icon": "string", "color": "string",
  "image": { "url": "string", "publicId": "string" }
}
```
**Response 200:** Updated category object
**Errors:** `404` — `{ "success": false, "message": "category not found" }`

### DELETE `/categories/:id`
**Response 200:** Deleted category object
**Errors:**
- `404` — `{ "success": false, "message": "category not found" }`

### DELETE `/categories/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "success": true, "message": "3 categories deleted" }`

---

# 5. Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/` | JWT | Create order (legacy) |
| POST | `/orders/checkout` | JWT | Full checkout with Stripe |
| POST | `/orders/confirm` | None | Confirm payment |
| POST | `/orders/:id/cancel` | Owner/Admin | Cancel order |
| POST | `/orders/create-checkout-session` | JWT | Legacy Stripe session |
| GET | `/orders/` | Admin | List all orders |
| GET | `/orders/:id` | Owner/Admin | Get by ID |
| PUT | `/orders/:id` | Admin | Update status/tracking |
| DELETE | `/orders/:id` | Admin | Delete order |
| DELETE | `/orders/` | Admin | Bulk delete |
| GET | `/orders/get/totalsales` | Admin | Total revenue |
| GET | `/orders/get/count` | Admin | Order count |
| GET | `/orders/getuserorders/:userid` | Owner/Admin | User's orders |

**Status state machine:** `Pending` → `Processed`/`Cancelled` → `Shipped`/`Cancelled` → `Delivered`

### POST `/orders/` (Legacy)
**Body:**
```json
{
  "orderItems": [{ "quantity": "number (required)", "product": "ObjectId (required)" }],
  "shippingAddress1": "string (required)",
  "shippingAddress2": "string (required)",
  "city": "string (required)", "zip": "string",
  "country": "string (required)", "phone": "string (required)",
  "user": "ObjectId"
}
```
**Response 200:** Created order object

### POST `/orders/checkout`
**Body:**
```json
{
  "orderItems": [{ "product": "ObjectId (required)", "quantity": "number (required)" }],
  "shippingAddress": {
    "street": "string (required)", "apartment": "string",
    "city": "string (required)", "country": "string (required)",
    "zip": "string", "phone": "string (required)",
    "latitude": "number (optional)", "longitude": "number (optional)"
  },
  "couponCode": "string (optional)", "customerEmail": "string (optional)"
}
```
**Response 200:**
```json
{ "sessionId": "string", "orderId": "string" }
```
**Errors:**
- `400` — `{ "message": "orderItems are required" }`
- `400` — `{ "message": "shippingAddress with city and country is required" }`
- `400` — `{ "message": "shippingAddress street and phone are required" }`
- `404` — `{ "message": "product not found: <id>" }`
- `409` — `{ "message": "insufficient stock for <name>" }`
- `400` — `{ "message": "<coupon error reason>" }`

### POST `/orders/confirm`
**Body:** `{ "sessionId": "string (required)" }`
**Response 200:** Order object (with `paymentStatus: 'paid'`)
**Errors:**
- `400` — `{ "message": "sessionId is required" }`
- `402` — `{ "message": "payment not completed", "paymentStatus": "string" }`
- `404` — `{ "message": "order not found" }`

### POST `/orders/:id/cancel`
**Body:** None
**Response 200:** Updated order object (status: `Cancelled`)
**Errors:**
- `404` — `{ "message": "order not found" }`
- `403` — `{ "message": "not allowed to cancel this order" }`
- `400` — `{ "message": "order cannot be cancelled in its current state" }`
- `502` — `{ "message": "refund failed, try again" }`

### POST `/orders/create-checkout-session`
**Body:** Array of order items:
```json
[{ "product": "ObjectId (required)", "quantity": "number (required)" }]
```
**Response 200:** `{ "id": "string" }` (Stripe session ID)

### GET `/orders/`
**Response 200:** Array of order objects with populated `user` (name only), sorted by `dateOrdered` desc

### GET `/orders/:id`
**Response 200:** Order object with populated `user` and `orderItems` (product with category)
**Errors:**
- `401` — `"not found"` (string)
- `403` — `{ "message": "not allowed" }`

### PUT `/orders/:id`
**Body (all optional):**
```json
{
  "status": "Pending|Processed|Shipped|Delivered|Cancelled",
  "trackingNumber": "string", "carrier": "string", "trackingUrl": "string",
  "orderNotes": [{ "text": "string", "createdAt": "ISO date" }],
  "refunded": 0,
  "refunds": [{ "amount": 0, "createdAt": "ISO date" }]
}
```
**Response 200:** Updated order object
**Errors:**
- `404` — `"not found"` (string)
- `400` — `{ "message": "invalid order status" }`
- `409` — `{ "message": "cannot change order from X to Y" }`

### DELETE `/orders/:id`
**Response 200:** `{ "success": true, "message": "order was deleted" }`
**Errors:** `404` — `{ "success": false, "message": "order is not found" }`

### DELETE `/orders/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "success": true, "message": "3 orders deleted" }`

### GET `/orders/get/totalsales`
**Response 200:** `{ "totalsales": 12345.67 }` or `{ "totalsales": 0 }`

### GET `/orders/get/count`
**Response 200:** `{ "orderCount": 200 }` or `{ "orderCount": 0 }`

### GET `/orders/getuserorders/:userid`
**Response 200:** Array of order objects with populated `orderItems` (product with category)

---

# 6. Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products/:productId/reviews` | None | Get reviews for product |
| POST | `/products/:productId/reviews` | JWT | Create review (verified purchase) |
| DELETE | `/reviews/:reviewId` | Owner/Admin | Delete review |
| DELETE | `/reviews/` | JWT | Bulk delete |

### GET `/products/:productId/reviews`
**Response 200:** Array of review objects with populated `user` (name), sorted by `dateCreated` desc
**Errors:** `404` — `{ "message": "product not found" }`

### POST `/products/:productId/reviews`
**Body:**
```json
{ "rating": "number 1-5 (required)", "comment": "string (optional)" }
```
**Response 201:** Created review object
**Errors:**
- `404` — `{ "message": "product not found" }`
- `401` — `{ "message": "authentication required" }`
- `403` — `{ "message": "only verified purchases can review this product" }`

### DELETE `/reviews/:reviewId`
**Response 200:** `{ "message": "review deleted" }`
**Errors:**
- `404` — `{ "message": "review not found" }`
- `403` — `{ "message": "not allowed to delete this review" }`

### DELETE `/reviews/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "message": "3 reviews deleted" }`
**Errors:** `400` — `{ "message": "ids array is required" }`

---

# 7. Coupons

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/coupons/` | Admin | List all coupons |
| POST | `/coupons/` | Admin | Create coupon |
| POST | `/coupons/validate` | None | Validate coupon code |
| PUT | `/coupons/:id` | Admin | Update coupon |
| DELETE | `/coupons/:id` | Admin | Delete coupon |
| DELETE | `/coupons/` | Admin | Bulk delete |

### GET `/coupons/`
**Response 200:** Array of coupon objects sorted by `dateCreated` desc
```json
{
  "_id": "string", "code": "UPPERCASE", "type": "percent|fixed",
  "value": 10, "maxUses": 100, "usedCount": 5, "active": true,
  "validFrom": "Date", "validUntil": "Date", "dateCreated": "Date"
}
```

### POST `/coupons/`
**Body:**
```json
{
  "code": "string (required)", "type": "percent|fixed (required)",
  "value": "number (required)", "maxUses": "number (optional, 0=unlimited)",
  "active": "boolean (optional)", "validFrom": "ISO date (optional)",
  "validUntil": "ISO date (optional)"
}
```
**Response 201:** Created coupon object

### POST `/coupons/validate`
**Body:** `{ "code": "string (required)" }`
**Response 200:** Full coupon object if valid
**Errors:**
- `400` — `{ "message": "code is required" }`
- `404` — `{ "message": "COUPON_NOT_FOUND|COUPON_INACTIVE|COUPON_NOT_STARTED|COUPON_EXPIRED|COUPON_MAX_USES|COUPON_INVALID_TYPE|COUPON_INVALID_VALUE" }`

### PUT `/coupons/:id`
**Body:** Any coupon fields (all optional)
**Response 200:** Updated coupon object
**Errors:** `404` — `{ "message": "coupon not found" }`

### DELETE `/coupons/:id`
**Response 200:** `{ "message": "coupon deleted" }`

### DELETE `/coupons/` (Bulk)
**Body:** `{ "ids": ["string", "string"] }`
**Response 200:** `{ "message": "3 coupons deleted" }`

---

# 8. Content (CMS Pages)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/content/` | Admin | List all pages |
| GET | `/content/:key` | None | Get page by key |
| POST | `/content/` | Admin | Create page |
| PUT | `/content/:id` | Admin | Update page |
| DELETE | `/content/:id` | Admin | Delete page |
| POST | `/content/contact-message` | None | Send contact message |

### GET `/content/`
**Response 200:** Array of content page objects, sorted by `updatedAt` desc

### GET `/content/:key`
**Response 200:**
```json
{
  "_id": "string", "key": "string",
  "title": { "en": "string", "ar": "string" },
  "subtitle": { "en": "string", "ar": "string" },
  "tagline": { "en": "string", "ar": "string" },
  "image": { "url": "string", "publicId": "string" },
  "sections": [
    {
      "heading": { "en": "string", "ar": "string" },
      "body": { "en": "string", "ar": "string" },
      "links": [{ "label": { "en": "string", "ar": "string" }, "href": "string" }]
    }
  ],
  "contact": {
    "email": "string", "phone": "string", "address": "string",
    "workingHours": "string",
    "social": { "facebook": "string", "instagram": "string", "twitter": "string", "whatsapp": "string" }
  }
}
```
**Errors:** `404` — `{ "message": "page not found" }`

### POST `/content/`
**Body:**
```json
{
  "key": "string (required, unique)",
  "title": "string | { en, ar } (localized, required)",
  "subtitle": "string | { en, ar } (localized, optional)",
  "tagline": "string | { en, ar } (localized, optional)",
  "image": { "url": "string", "publicId": "string" },
  "sections": [
    {
      "heading": "string | { en, ar }", "body": "string | { en, ar }",
      "links": [{ "label": "string | { en, ar }", "href": "string" }]
    }
  ],
  "contact": { "email": "string", "phone": "string", "address": "string", "workingHours": "string",
    "social": { "facebook": "string", "instagram": "string", "twitter": "string", "whatsapp": "string" } }
}
```
**Response 201:** Created content page object

### PUT `/content/:id`
**Body:** Same as POST (all fields optional)
**Response 200:** Updated content page object
**Errors:** `404` — `{ "message": "page not found" }`

### DELETE `/content/:id`
**Response 200:** `{ "message": "page deleted" }`
**Errors:** `404` — `{ "message": "page not found" }`

### POST `/content/contact-message`
**Body:**
```json
{
  "name": "string (required, max 100)",
  "email": "string (required, valid email)",
  "subject": "string (optional, max 200)",
  "message": "string (required, max 5000)"
}
```
**Response 200:** `{ "message": "message sent" }`
**Errors:**
- `400` — `{ "message": "name is required" }`
- `400` — `{ "message": "a valid email is required" }`
- `400` — `{ "message": "message is required" }`
- `400` — `{ "message": "input is too long" }`

---

# 9. Media (File Upload)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/media/images` | JWT | Upload multiple images |
| POST | `/media/image` | JWT | Upload single image |
| POST | `/media/videos` | JWT | Upload multiple videos |
| POST | `/media/video` | JWT | Upload single video |

All routes use `multipart/form-data`. Files are uploaded to Cloudinary, temp local files deleted.

### POST `/media/images`
**Form fields:** `images` (file[], max 10, `image/*`, 5MB each), `folder` (string, optional)
**Response 200:** `{ "success": true, "images": [{ "url": "string", "publicId": "string", "folder": "string" }] }`
**Errors:** `400` — `{ "success": false, "message": "no images uploaded" }`

### POST `/media/image`
**Form fields:** `image` (file, `image/*`, 5MB), `folder` (string, optional)
**Response 200:** `{ "success": true, "image": { "url": "string", "publicId": "string", "folder": "string" } }`
**Errors:** `400` — `{ "success": false, "message": "no image uploaded" }`

### POST `/media/videos`
**Form fields:** `videos` (file[], max 10, `video/*`, 100MB each), `folder` (string, optional)
**Response 200:** `{ "success": true, "videos": [{ "url": "string", "publicId": "string", "folder": "string" }] }`
**Errors:** `400` — `{ "success": false, "message": "no videos uploaded" }`

### POST `/media/video`
**Form fields:** `video` (file, `video/*`, 100MB), `folder` (string, optional)
**Response 200:** `{ "success": true, "video": { "url": "string", "publicId": "string", "folder": "string" } }`
**Errors:** `400` — `{ "success": false, "message": "no video uploaded" }`

---

# 10. Settings (SEO)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/settings/seo` | None | Get SEO settings |
| PUT | `/settings/seo` | Admin | Update SEO settings |

### GET `/settings/seo`
**Response 200:**
```json
{
  "title": { "en": "string", "ar": "string" },
  "description": { "en": "string", "ar": "string" },
  "keywords": { "en": "string", "ar": "string" },
  "logoUrl": "string", "faviconUrl": "string",
  "socialImageUrl": "string", "canonicalUrl": "string"
}
```
Auto-creates defaults if none exist.

### PUT `/settings/seo`
**Body (all optional):**
```json
{
  "title": "string | { en, ar }", "description": "string | { en, ar }",
  "keywords": "string | { en, ar }", "logoUrl": "string",
  "faviconUrl": "string", "socialImageUrl": "string", "canonicalUrl": "string"
}
```
**Response 200:** Updated SEO settings object
**Errors:** `400|500` — `{ "message": "Could not save site settings" }`

---

# 11. Dashboard

All endpoints require **Admin** auth.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/summary` | Overview stats |
| GET | `/dashboard/revenue-over-time` | Revenue chart data |
| GET | `/dashboard/top-products` | Top sellers |
| GET | `/dashboard/category-distribution` | Products per category |
| GET | `/dashboard/reviews-summary` | Rating distribution |
| GET | `/dashboard/recent-orders` | Recent orders |
| GET | `/dashboard/user-growth` | User registration chart |
| GET | `/dashboard/top-products-chart` | Top products chart |

### GET `/dashboard/summary`
**Response 200:**
```json
{
  "totalRevenue": 50000, "totalOrders": 200, "totalProducts": 150,
  "totalUsers": 300, "totalReviews": 450, "pendingOrders": 12,
  "lowStockProducts": 5, "averageOrderValue": 250,
  "ordersByStatus": [{ "status": "Pending", "count": 12 }],
  "paymentStatusBreakdown": [{ "status": "paid", "count": 180 }]
}
```

### GET `/dashboard/revenue-over-time`
**Query:** `period` (day|week|month, default "day"), `days` (default 30), `startDate`, `endDate`
**Response 200:** `[{ "date": "2026-09-01", "revenue": 1500, "orderCount": 5 }]`

### GET `/dashboard/top-products`
**Query:** `limit` (default 10)
**Response 200:** `[{ "product": { "id": "string", "name": { en, ar }, "price": 99.99, "image": { url, publicId } }, "totalSold": 150 }]`

### GET `/dashboard/category-distribution`
**Response 200:** `[{ "category": { "id": "string", "name": { en, ar } }, "count": 25 }]`

### GET `/dashboard/reviews-summary`
**Response 200:**
```json
{
  "totalReviews": 450, "averageRating": 4.3,
  "ratingDistribution": [{ "rating": 1, "count": 10 }]
}
```

### GET `/dashboard/recent-orders`
**Query:** `limit` (default 10)
**Response 200:** Array of order objects (fields: `user`, `totalPrice`, `status`, `paymentStatus`, `dateOrdered`), populated user with `name` and `email`

### GET `/dashboard/user-growth`
**Query:** `period` (day|week|month, default "day"), `days` (default 30)
**Response 200:** `[{ "date": "2026-09-01", "count": 5 }]`

### GET `/dashboard/top-products-chart`
**Query:** `limit` (default 10)
**Response 200:** `[{ "name": "string", "totalSold": 150, "revenue": 14998.50 }]`

---

# 12. Export

All endpoints require **Admin** auth. Returns `.xlsx` file download.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/orders` | Export orders |
| GET | `/export/products` | Export products |
| GET | `/export/users` | Export users |

- `/export/orders` — Columns: Order ID, Customer, Total, Status, Payment, Date
- `/export/products` — Columns: Name, Price, Category, Stock, Rating, Featured, Date Created
- `/export/users` — Columns: Name, Email, Phone, Admin, City, Country

---

# 13. Addresses

Mounted under `/users/:userId/addresses`. All require **Owner/Admin** auth.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:userId/addresses` | Owner | List addresses |
| POST | `/users/:userId/addresses` | Owner | Create address |
| PUT | `/users/:userId/addresses/:addressId` | Owner | Update address |
| DELETE | `/users/:userId/addresses/:addressId` | Owner | Delete address |

### POST `/users/:userId/addresses`
**Body:**
```json
{
  "label": "Home (optional, default 'Home')",
  "street": "string (required)", "apartment": "string",
  "city": "string (required)", "zip": "string",
  "country": "string (required)", "phone": "string (required)",
  "isDefault": "boolean (optional, resets others if true)"
}
```
**Response 201:** Created address object

### PUT `/users/:userId/addresses/:addressId`
**Body:** Same fields as POST (all optional)
**Response 200:** Updated address object
**Errors:** `404` — `{ "message": "address not found" }`

### DELETE `/users/:userId/addresses/:addressId`
**Response 200:** `{ "message": "address deleted" }`
**Errors:** `404` — `{ "message": "address not found" }`

---

# 14. Wishlist

All endpoints require **JWT** auth.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist/` | JWT | Get wishlist |
| POST | `/wishlist/:productId` | JWT | Add to wishlist |
| DELETE | `/wishlist/:productId` | JWT | Remove from wishlist |
| GET | `/wishlist/check/:productId` | JWT | Check if in wishlist |

### GET `/wishlist/`
**Response 200:** Array of product objects (fully populated)
**Errors:** `404` — `{ "message": "User not found" }`

### POST `/wishlist/:productId`
**Response 200:** Updated wishlist (populated products)
**Errors:**
- `404` — `{ "message": "User not found" }`
- `200` — `{ "message": "Product already in wishlist" }`

### DELETE `/wishlist/:productId`
**Response 200:** Updated wishlist (populated products)
**Errors:**
- `404` — `{ "message": "User not found" }`
- `404` — `{ "message": "Product not in wishlist" }`

### GET `/wishlist/check/:productId`
**Response 200:** `{ "inWishlist": true }`
**Errors:** `404` — `{ "message": "User not found" }`

---

# 15. Roles

All endpoints require **Admin** auth.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/roles/` | Admin | List all roles |
| GET | `/roles/:id` | Admin | Get role by ID |
| POST | `/roles/` | Admin | Create role |
| PUT | `/roles/:id` | Admin | Update role |
| DELETE | `/roles/:id` | Admin | Delete role |

### GET `/roles/`
**Response 200:** Array of role objects
```json
{
  "_id": "string", "name": "string", "permissions": ["string"],
  "isDefault": false, "createdAt": "Date", "updatedAt": "Date"
}
```

### GET `/roles/:id`
**Response 200:** Role object
**Errors:** `404` — `{ "message": "role not found" }`

### POST `/roles/`
**Body:**
```json
{
  "name": "string (required, unique)",
  "permissions": ["string (optional)"],
  "isDefault": "boolean (optional, default false)"
}
```
**Response 201:** Created role object
**Errors:**
- `400` — `{ "message": "name is required" }`
- `400` — `{ "message": "role name already exists" }`

### PUT `/roles/:id`
**Body:** `{ "name": "string", "permissions": ["string"], "isDefault": "boolean" }`
**Response 200:** Updated role object
**Errors:** `404` — `{ "message": "role not found" }`

### DELETE `/roles/:id`
**Response 200:** `{ "message": "role deleted" }`
**Errors:**
- `404` — `{ "message": "role not found" }`
- `400` — `{ "message": "cannot delete default role" }`

---

# 16. Permissions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/permissions/` | Admin | List available permission keys |

### GET `/permissions/`
**Response 200:**
```json
[
  "dashboard:read",
  "products:read", "products:create", "products:update", "products:delete",
  "categories:read", "categories:create", "categories:update", "categories:delete",
  "orders:read", "orders:update", "orders:delete",
  "users:read", "users:create", "users:update", "users:delete",
  "coupons:read", "coupons:create", "coupons:update", "coupons:delete",
  "content:read", "content:create", "content:update", "content:delete",
  "reviews:read", "reviews:delete",
  "roles:read", "roles:create", "roles:update", "roles:delete", "roles:manage"
]
```

---

# 17. Shipping

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/shipping/` | None | Get shipping config |
| PUT | `/shipping/` | Admin | Update shipping config |

### GET `/shipping/`
**Response 200:**
```json
{
  "freeShippingThreshold": 500, "baseRate": 50,
  "originLatitude": 30.0444, "originLongitude": 31.2357,
  "distanceRate": 2.5, "currency": "EGP",
  "rates": [{ "label": "Cairo", "city": "Cairo", "country": "Egypt", "rate": 30 }]
}
```
Auto-creates defaults if none exist.

### PUT `/shipping/`
**Body (all optional):**
```json
{
  "freeShippingThreshold": "number (min 0)",
  "baseRate": "number (min 0)",
  "originLatitude": "number (-90 to 90)",
  "originLongitude": "number (-180 to 180)",
  "distanceRate": "number (min 0)",
  "currency": "string",
  "rates": [{ "label": "string", "city": "string", "country": "string", "rate": "number (min 0)" }]
}
```
**Response 200:** Updated shipping config object

---

# 18. Two-Factor Authentication

All endpoints require **JWT** auth.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/2fa/setup` | JWT | Generate TOTP secret + QR |
| POST | `/2fa/verify` | JWT | Verify TOTP and enable 2FA |
| POST | `/2fa/disable` | JWT | Disable 2FA |
| GET | `/2fa/status` | JWT | Check 2FA status |

### POST `/2fa/setup`
**Body:** None
**Response 200:**
```json
{ "secret": "string (Base32)", "qrCode": "string (data URL)" }
```
**Errors:**
- `401` — `{ "message": "Unauthorized" }`
- `404` — `{ "message": "User not found" }`

### POST `/2fa/verify`
**Body:** `{ "token": "string (required, 6-digit TOTP)" }`
**Response 200:** `{ "message": "2FA enabled successfully" }`
**Errors:**
- `401` — `{ "message": "Unauthorized" }`
- `400` — `{ "message": "2FA not setup" }`
- `400` — `{ "message": "Invalid token" }`

### POST `/2fa/disable`
**Body:** `{ "token": "string (required, 6-digit TOTP)" }`
**Response 200:** `{ "message": "2FA disabled successfully" }`
**Errors:**
- `401` — `{ "message": "Unauthorized" }`
- `400` — `{ "message": "2FA not enabled" }`
- `400` — `{ "message": "Invalid token" }`

### GET `/2fa/status`
**Response 200:** `{ "enabled": true }`

---

# 19. Webhooks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/webhooks/stripe` | Stripe signature | Receive Stripe events |

### POST `/webhooks/stripe`
**Body:** Raw binary (Stripe event payload). Requires `stripe-signature` header.

**Handled events:**
- `checkout.session.completed` — Marks order as `paid`, decrements stock, increments coupon usage
- `checkout.session.expired` — Marks order as `failed`/`Cancelled`

**Response 200:** `{ "received": true }`
**Errors:** `400` — `"Webhook Error: <message>"` (string)

---

# 20. Audit Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit-logs/my` | JWT | Get own audit logs |
| GET | `/audit-logs/` | Admin | Get all audit logs |
| GET | `/audit-logs/entities` | Admin | Get distinct entity types |

### GET `/audit-logs/my`
**Query:** `page` (default 1), `limit` (default 50), `entity`, `action`
**Response 200:**
```json
{
  "logs": [{ "_id": "string", "action": "string", "entity": "string",
    "entityId": "ObjectId", "user": "ObjectId", "changes": "Mixed",
    "ip": "string", "userAgent": "string", "createdAt": "Date" }],
  "total": 100, "page": 1, "totalPages": 2
}
```

### GET `/audit-logs/`
**Query:** `page` (default 1), `limit` (default 50), `entity`, `action`, `userId`
**Response 200:** Same shape as `/my` but with populated `user` (name, email)

### GET `/audit-logs/entities`
**Response 200:** `["Product", "Order", "User", "Category"]`

---

# Quick Reference: All 101 Endpoints

| # | Method | Route | Auth |
|---|--------|-------|------|
| 1 | POST | `/auth/refresh` | None |
| 2 | POST | `/auth/logout` | None |
| 3 | POST | `/users/register` | None |
| 4 | POST | `/users/login` | None |
| 5 | POST | `/users/forgot-password` | None |
| 6 | POST | `/users/reset-password` | None |
| 7 | POST | `/users/verify-email` | None |
| 8 | POST | `/users/resend-verification` | None |
| 9 | GET | `/users/profile` | Owner |
| 10 | PUT | `/users/profile` | Owner |
| 11 | GET | `/users/` | Admin |
| 12 | GET | `/users/:id` | Owner/Admin |
| 13 | PUT | `/users/:id` | Owner/Admin |
| 14 | DELETE | `/users/:id` | JWT |
| 15 | DELETE | `/users/` (bulk) | JWT |
| 16 | GET | `/users/get/count` | JWT |
| 17 | GET | `/products/` | None |
| 18 | GET | `/products/:id` | None |
| 19 | POST | `/products/` | products:create |
| 20 | PUT | `/products/:id` | products:update |
| 21 | PUT | `/products/gallery-images/:id` | products:update |
| 22 | DELETE | `/products/:id` | products:delete |
| 23 | DELETE | `/products/` (bulk) | products:delete |
| 24 | GET | `/products/get/count` | None |
| 25 | GET | `/products/get/featured/:count` | None |
| 26 | GET | `/categories/` | None |
| 27 | GET | `/categories/:id` | None |
| 28 | POST | `/categories/` | categories:create |
| 29 | PUT | `/categories/:id` | categories:update |
| 30 | DELETE | `/categories/:id` | categories:delete |
| 31 | DELETE | `/categories/` (bulk) | categories:delete |
| 32 | POST | `/orders/` | JWT |
| 33 | POST | `/orders/checkout` | JWT |
| 34 | POST | `/orders/confirm` | None |
| 35 | POST | `/orders/:id/cancel` | Owner/Admin |
| 36 | POST | `/orders/create-checkout-session` | JWT |
| 37 | GET | `/orders/` | Admin |
| 38 | GET | `/orders/:id` | Owner/Admin |
| 39 | PUT | `/orders/:id` | Admin |
| 40 | DELETE | `/orders/:id` | Admin |
| 41 | DELETE | `/orders/` (bulk) | Admin |
| 42 | GET | `/orders/get/totalsales` | Admin |
| 43 | GET | `/orders/get/count` | Admin |
| 44 | GET | `/orders/getuserorders/:userid` | Owner/Admin |
| 45 | GET | `/products/:productId/reviews` | None |
| 46 | POST | `/products/:productId/reviews` | JWT |
| 47 | DELETE | `/reviews/:reviewId` | Owner/Admin |
| 48 | DELETE | `/reviews/` (bulk) | JWT |
| 49 | GET | `/coupons/` | Admin |
| 50 | POST | `/coupons/` | Admin |
| 51 | POST | `/coupons/validate` | None |
| 52 | PUT | `/coupons/:id` | Admin |
| 53 | DELETE | `/coupons/:id` | Admin |
| 54 | DELETE | `/coupons/` (bulk) | Admin |
| 55 | GET | `/content/` | Admin |
| 56 | GET | `/content/:key` | None |
| 57 | POST | `/content/` | Admin |
| 58 | POST | `/content/contact-message` | None |
| 59 | PUT | `/content/:id` | Admin |
| 60 | DELETE | `/content/:id` | Admin |
| 61 | POST | `/media/images` | JWT |
| 62 | POST | `/media/image` | JWT |
| 63 | POST | `/media/videos` | JWT |
| 64 | POST | `/media/video` | JWT |
| 65 | GET | `/settings/seo` | None |
| 66 | PUT | `/settings/seo` | Admin |
| 67 | GET | `/dashboard/summary` | Admin |
| 68 | GET | `/dashboard/revenue-over-time` | Admin |
| 69 | GET | `/dashboard/top-products` | Admin |
| 70 | GET | `/dashboard/category-distribution` | Admin |
| 71 | GET | `/dashboard/reviews-summary` | Admin |
| 72 | GET | `/dashboard/recent-orders` | Admin |
| 73 | GET | `/dashboard/user-growth` | Admin |
| 74 | GET | `/dashboard/top-products-chart` | Admin |
| 75 | GET | `/export/orders` | Admin |
| 76 | GET | `/export/products` | Admin |
| 77 | GET | `/export/users` | Admin |
| 78 | GET | `/users/:userId/addresses` | Owner |
| 79 | POST | `/users/:userId/addresses` | Owner |
| 80 | PUT | `/users/:userId/addresses/:addressId` | Owner |
| 81 | DELETE | `/users/:userId/addresses/:addressId` | Owner |
| 82 | GET | `/wishlist/` | JWT |
| 83 | POST | `/wishlist/:productId` | JWT |
| 84 | DELETE | `/wishlist/:productId` | JWT |
| 85 | GET | `/wishlist/check/:productId` | JWT |
| 86 | GET | `/roles/` | Admin |
| 87 | GET | `/roles/:id` | Admin |
| 88 | POST | `/roles/` | Admin |
| 89 | PUT | `/roles/:id` | Admin |
| 90 | DELETE | `/roles/:id` | Admin |
| 91 | GET | `/permissions/` | Admin |
| 92 | GET | `/shipping/` | None |
| 93 | PUT | `/shipping/` | Admin |
| 94 | POST | `/2fa/setup` | JWT |
| 95 | POST | `/2fa/verify` | JWT |
| 96 | POST | `/2fa/disable` | JWT |
| 97 | GET | `/2fa/status` | JWT |
| 98 | POST | `/webhooks/stripe` | Stripe sig |
| 99 | GET | `/audit-logs/my` | JWT |
| 100 | GET | `/audit-logs/` | Admin |
| 101 | GET | `/audit-logs/entities` | Admin |
