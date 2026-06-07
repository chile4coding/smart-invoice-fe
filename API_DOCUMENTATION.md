# Smart Invoicer API Documentation

## Base URL

```
http://localhost:{PORT}/api
```

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

## Role Hierarchy

`SUPER_ADMIN` > `ADMIN` > `USER`

## Standard Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      { "field": "fieldName", "message": "Validation message" }
    ]
  }
}
```

> **Note on monetary values:** All amounts (`unitPrice`, `subtotal`, `taxAmount`, `discount`, `grandTotal`) are stored and returned in **minor units** (e.g., kobo for NGN, cents for USD).

---

## Health Check

### GET /health

Check API health status. No authentication required.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-04T10:00:00.000Z"
}
```

---

## Auth

### POST /api/auth/login

Authenticate and receive a JWT access token.

**Rate limit:** 10 attempts per 15 minutes.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-06-04T10:00:00.000Z",
      "updatedAt": "2026-06-04T10:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

**Error `401`:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password"
  }
}
```

---

### POST /api/auth/logout

Invalidate the current session. Requires authentication.

**Request body:** None

**Response `200`:**
```json
{
  "success": true,
  "data": null,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/me

Get the currently authenticated user's profile. Requires authentication.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  }
}
```

---

## Users

> All user endpoints require **SUPER_ADMIN** role.

### POST /api/users

Create a new user.

**Request body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "ADMIN"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `firstName` | string | Yes | Trimmed |
| `lastName` | string | Yes | Trimmed |
| `email` | string | Yes | Valid email format |
| `password` | string | Yes | Minimum 8 characters |
| `role` | string | Yes | `"ADMIN"` or `"USER"` |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMIN",
    "isActive": true,
    "createdById": "uuid-of-creator",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  },
  "message": "User created successfully"
}
```

---

### GET /api/users

List all users with pagination and optional search.

**Query parameters:**

| Parameter | Type | Required | Default | Notes |
|-----------|------|----------|---------|-------|
| `page` | integer | No | `1` | Minimum 1 |
| `limit` | integer | No | `10` | Range: 1–100 |
| `search` | string | No | — | Searches `firstName`, `lastName`, `email` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "jane@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "ADMIN",
        "isActive": true,
        "createdById": "uuid",
        "createdAt": "2026-06-04T10:00:00.000Z",
        "updatedAt": "2026-06-04T10:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### GET /api/users/:id

Get a specific user by ID.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMIN",
    "isActive": true,
    "createdById": "uuid",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  }
}
```

**Error `404`:** User not found.

---

### PATCH /api/users/:id/password

Change a user's password.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Request body:**
```json
{
  "newPassword": "newSecurePassword"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `newPassword` | string | Yes | Minimum 8 characters |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMIN",
    "isActive": true,
    "createdById": "uuid",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  },
  "message": "Password updated successfully"
}
```

---

### PATCH /api/users/:id/role

Change a user's role.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Request body:**
```json
{
  "role": "ADMIN"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `role` | string | Yes | `"ADMIN"`, `"USER"`, or `"SUPER_ADMIN"` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "jane@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "ADMIN",
    "isActive": true,
    "createdById": "uuid",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  },
  "message": "Role updated successfully"
}
```

---

### DELETE /api/users/:id

Deactivate a user (soft delete).

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `204`:** No content.

---

## Invoices

> Creating, updating, and deleting invoices requires **ADMIN** or **SUPER_ADMIN** role. Listing and viewing invoices is available to all authenticated users.

### POST /api/invoices

Create a new invoice.

**Request body:**
```json
{
  "clientName": "Acme Corp",
  "clientEmail": "billing@acme.com",
  "clientAddress": "123 Main St, Lagos",
  "clientPhone": "+2348012345678",
  "issueDate": "2026-06-04T00:00:00.000Z",
  "dueDate": "2026-07-04T00:00:00.000Z",
  "taxRate": 7.5,
  "discount": 5000,
  "currency": "NGN",
  "notes": "Payment due within 30 days.",
  "lineItems": [
    {
      "description": "Web Development",
      "quantity": 1,
      "unitPrice": 50000000
    },
    {
      "description": "Hosting (1 year)",
      "quantity": 1,
      "unitPrice": 12000000
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `clientName` | string | Yes | Trimmed |
| `clientEmail` | string | Yes | Valid email format |
| `clientAddress` | string | No | |
| `clientPhone` | string | No | |
| `issueDate` | string | Yes | ISO 8601 date |
| `dueDate` | string | Yes | ISO 8601 date |
| `taxRate` | number | No | 0–100 |
| `discount` | integer | No | Non-negative, in minor units |
| `currency` | string | No | 3-character code, default `"NGN"` |
| `notes` | string | No | |
| `lineItems` | array | Yes | Minimum 1 item (see below) |

**Line item fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `description` | string | Yes | Trimmed |
| `quantity` | integer | Yes | Minimum 1 |
| `unitPrice` | integer | Yes | Non-negative, in minor units |

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-0001",
    "status": "DRAFT",
    "clientName": "Acme Corp",
    "clientEmail": "billing@acme.com",
    "clientAddress": "123 Main St, Lagos",
    "clientPhone": "+2348012345678",
    "issueDate": "2026-06-04T00:00:00.000Z",
    "dueDate": "2026-07-04T00:00:00.000Z",
    "subtotal": 62000000,
    "taxRate": 7.5,
    "taxAmount": 4650000,
    "discount": 5000,
    "grandTotal": 66645000,
    "currency": "NGN",
    "notes": "Payment due within 30 days.",
    "lineItems": [
      {
        "id": "uuid",
        "description": "Web Development",
        "quantity": 1,
        "unitPrice": 50000000,
        "total": 50000000
      },
      {
        "id": "uuid",
        "description": "Hosting (1 year)",
        "quantity": 1,
        "unitPrice": 12000000,
        "total": 12000000
      }
    ],
    "createdById": "uuid",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  },
  "message": "Invoice created successfully"
}
```

---

### GET /api/invoices

List all invoices with filtering and pagination.

**Query parameters:**

| Parameter | Type | Required | Default | Notes |
|-----------|------|----------|---------|-------|
| `page` | integer | No | `1` | Minimum 1 |
| `limit` | integer | No | `10` | Range: 1–100 |
| `search` | string | No | — | Searches `invoiceNumber`, `clientName`, `clientEmail` |
| `status` | string | No | — | `"DRAFT"`, `"SAVED"`, or `"SENT"` |
| `startDate` | string | No | — | ISO 8601 date; filters `issueDate >= startDate` |
| `endDate` | string | No | — | ISO 8601 date; filters `issueDate <= endDate` |
| `sortBy` | string | No | `"createdAt"` | `"createdAt"`, `"issueDate"`, `"dueDate"`, `"grandTotal"` |
| `order` | string | No | `"desc"` | `"asc"` or `"desc"` |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "uuid",
        "invoiceNumber": "INV-0001",
        "status": "DRAFT",
        "clientName": "Acme Corp",
        "clientEmail": "billing@acme.com",
        "clientAddress": "123 Main St, Lagos",
        "clientPhone": "+2348012345678",
        "issueDate": "2026-06-04T00:00:00.000Z",
        "dueDate": "2026-07-04T00:00:00.000Z",
        "subtotal": 62000000,
        "taxRate": 7.5,
        "taxAmount": 4650000,
        "discount": 5000,
        "grandTotal": 66645000,
        "currency": "NGN",
        "notes": "Payment due within 30 days.",
        "lineItems": [ { "..." : "..." } ],
        "createdById": "uuid",
        "createdAt": "2026-06-04T10:00:00.000Z",
        "updatedAt": "2026-06-04T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

### GET /api/invoices/:id

Get a specific invoice by ID, including its line items.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "invoiceNumber": "INV-0001",
    "status": "DRAFT",
    "clientName": "Acme Corp",
    "clientEmail": "billing@acme.com",
    "clientAddress": "123 Main St, Lagos",
    "clientPhone": "+2348012345678",
    "issueDate": "2026-06-04T00:00:00.000Z",
    "dueDate": "2026-07-04T00:00:00.000Z",
    "subtotal": 62000000,
    "taxRate": 7.5,
    "taxAmount": 4650000,
    "discount": 5000,
    "grandTotal": 66645000,
    "currency": "NGN",
    "notes": "Payment due within 30 days.",
    "lineItems": [
      {
        "id": "uuid",
        "description": "Web Development",
        "quantity": 1,
        "unitPrice": 50000000,
        "total": 50000000
      }
    ],
    "createdById": "uuid",
    "createdAt": "2026-06-04T10:00:00.000Z",
    "updatedAt": "2026-06-04T10:00:00.000Z"
  }
}
```

**Error `404`:** Invoice not found.

---

### PUT /api/invoices/:id

Fully replace an invoice and all its line items. Requires **ADMIN** or **SUPER_ADMIN** role.

> **Note:** All existing line items are deleted and replaced with the new ones provided.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Request body:** Same schema as `POST /api/invoices` — all fields required.

**Response `200`:**
```json
{
  "success": true,
  "data": { "...updated invoice object..." },
  "message": "Invoice updated successfully"
}
```

---

### PATCH /api/invoices/:id/status

Update only the status of an invoice. Requires **ADMIN** or **SUPER_ADMIN** role.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Request body:**
```json
{
  "status": "SENT"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `status` | string | Yes | `"DRAFT"`, `"SAVED"`, or `"SENT"` |

**Response `200`:**
```json
{
  "success": true,
  "data": { "...updated invoice object..." },
  "message": "Invoice status updated"
}
```

---

### DELETE /api/invoices/:id

Permanently delete an invoice. Requires **ADMIN** or **SUPER_ADMIN** role.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `204`:** No content.

---

### GET /api/invoices/:id/preview

Get an HTML preview of an invoice. Requires **ADMIN** or **SUPER_ADMIN** role.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `200`:**
- **Content-Type:** `text/html`
- **Body:** Rendered HTML invoice page.

---

### GET /api/invoices/:id/pdf

Download an invoice as a PDF file. Requires **ADMIN** or **SUPER_ADMIN** role.

**Path parameters:**

| Parameter | Type | Notes |
|-----------|------|-------|
| `id` | UUID string | |

**Response `200`:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-{invoiceNumber}.pdf"`
- **Body:** Binary PDF content.

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (successful delete) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role) |
| `404` | Not Found |
| `429` | Too Many Requests (rate limit exceeded) |
| `500` | Internal Server Error |
