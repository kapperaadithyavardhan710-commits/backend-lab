# Backend Development Fundamentals - Lab 03
## REST API, Query Parameters, Validation, and Debugging

### Student Details
- **Student Name:** KAPPERA ADITHYA VARDHAN
- **Registration Number:** 252U1R9060
- **Course:** Backend Development Fundamentals
- **Branch:** CSE – Gen AI
- **Institution:** Aurora
- **Faculty:** Joel Prashanth D

---

## 1. Project Overview

This repository contains the complete implementation of **Lab 03: REST API, Query Parameters, Validation, and Debugging** for the **Backend Development Fundamentals** course.

The project demonstrates building an enterprise-grade RESTful API service using **Node.js**, **Express.js**, and **SQLite3**. It manages a bookstore database with full CRUD capabilities, high-performance query parameter handling (filtering, searching, multi-column sorting, pagination), comprehensive input validation with informative JSON error payloads, HTTP status compliance, and defensive backend debugging and crash prevention.

---

## 2. Project Objectives

- Implement a robust RESTful API following HTTP/1.1 specifications.
- Build clean CRUD operations on an SQLite relational database with parameterized queries to prevent SQL injection vulnerabilities.
- Implement advanced query parameter features on `GET /books`:
  - Partial title text searching (`search_q`).
  - Column whitelisting and directional sorting (`order_by`, `order`).
  - Boundary-checked numeric price filtering (`min_price`, `max_price`).
  - Strict integer-based pagination (`limit`, `offset`).
  - Full composability allowing all parameters to be combined seamlessly.
- Implement exhaustive request validation for query strings, route parameters, and JSON request bodies.
- Enforce strict HTTP status code semantics (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).
- Implement defensive error handling for port collision (`EADDRINUSE`), database connection issues, malformed JSON syntax, and unhandled routes.

---

## 3. Technology Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+ / v20+ / v24+)
- **Web Framework:** [Express.js](https://expressjs.com/) (v4.19+)
- **Database Engine:** [SQLite3](https://www.sqlite.org/) via `sqlite3` npm driver (v5.1+)
- **Language:** JavaScript (ES6+ / CommonJS)
- **API Testing Client:** [Postman](https://www.postman.com/)

---

## 4. Project Folder Structure

```text
lab-03/
│
├── screenshots/             # Directory containing Postman response evidence
│
├── app.js                  # Express application setup, routes, validators, error handlers
├── database.js             # SQLite connection, schema creation, query abstraction, seed data
├── initDB.sql              # SQL DDL table schema and initial seed data statements
├── package.json            # Node.js project manifest, scripts, and dependencies
├── package-lock.json       # Exact locked dependency tree
├── .gitignore              # Git ignore rules (node_modules, books.db, logs)
└── README.md               # Comprehensive project documentation
```

---

## 5. Database Setup & Schema

The application utilizes an embedded **SQLite** database stored in `books.db`.

### 5.1 Schema (`initDB.sql`)

```sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price REAL NOT NULL,
  pages INTEGER
);
```

### 5.2 Automatic Initialization & Duplicate Prevention

When `app.js` starts, it invokes `initDatabase()` from `database.js`:
1. It creates the `books` table if it does not already exist (`CREATE TABLE IF NOT EXISTS`).
2. It queries `SELECT COUNT(*) AS count FROM books`.
3. If `count === 0`, it inserts 12 comprehensive sample books using parameterized statements.
4. If records already exist (`count > 0`), seeding is skipped automatically, preventing duplicate records on server restarts.

### 5.3 Initial Seed Data

| ID | Title | Author | Price (₹) | Pages |
|:---|:---|:---|:---:|:---:|
| 1 | Effective Java | Joshua Bloch | 450.00 | 416 |
| 2 | Java: The Complete Reference | Herbert Schildt | 650.00 | 1248 |
| 3 | Head First Java | Kathy Sierra | 520.00 | 720 |
| 4 | Clean Code | Robert C. Martin | 480.00 | 464 |
| 5 | Design Patterns: Elements of Reusable Object-Oriented Software | Erich Gamma et al. | 550.00 | 395 |
| 6 | The Pragmatic Programmer | Andrew Hunt and David Thomas | 499.00 | 352 |
| 7 | JavaScript: The Good Parts | Douglas Crockford | 320.00 | 176 |
| 8 | Eloquent JavaScript | Marijn Haverbeke | 380.00 | 472 |
| 9 | Learning Python | Mark Lutz | 590.00 | 1648 |
| 10 | Database System Concepts | Abraham Silberschatz | 720.00 | 1376 |
| 11 | Artificial Intelligence: A Modern Approach | Stuart Russell and Peter Norvig | 850.00 | 1152 |
| 12 | Introduction to the Theory of Computation | Michael Sipser | 620.00 | 504 |

---

## 6. Installation & Server Execution

### Prerequisites
- Node.js installed (`node -v` should show v18.0.0 or higher)
- npm installed (`npm -v`)

### Step 1: Navigate to the Project Directory
```bash
cd lab-03
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Application Server
```bash
npm start
```

For automatic reloading during development:
```bash
npm run dev
```

### Console Startup Output
```text
[DB INFO] Successfully connected to SQLite database: books.db
[INIT] Initializing database...
[DB INFO] Table 'books' verified / created successfully.
[DB INFO] Database already contains 12 books. Skipping seed to prevent duplicates.
[INIT] Server running and listening on http://0.0.0.0:3000
[INIT] Access API locally at http://localhost:3000
```

The application binds to host `0.0.0.0` and defaults to port `3000`, or uses the port defined by `process.env.PORT` for deployment compatibility.

---

## 7. REST API Endpoints

| HTTP Method | Endpoint | Description | Status Codes |
|:---|:---|:---|:---:|
| `GET` | `/` | API welcome message and route catalog | `200` |
| `GET` | `/books` | Retrieve books with optional search, sorting, filtering, and pagination | `200`, `400`, `500` |
| `GET` | `/books/:id` | Retrieve a single book by numeric ID | `200`, `400`, `404`, `500` |
| `POST` | `/books` | Add a new book to the database | `201`, `400`, `500` |
| `PUT` | `/books/:id` | Update an existing book by numeric ID | `200`, `400`, `404`, `500` |
| `DELETE` | `/books/:id` | Delete a book by numeric ID | `200`, `400`, `404`, `500` |

---

## 8. Query Parameters Specification (`GET /books`)

All query parameters on `GET /books` are completely composable:

### 8.1 Search by Title (`search_q`)
- **Description:** Performs case-insensitive partial substring matching on the book `title`.
- **SQL Implementation:** `title LIKE ?` with `%search_q%`.
- **Example:**
  ```http
  GET /books?search_q=Java
  ```

### 8.2 Column Sorting (`order_by` & `order`)
- **`order_by`:** Specifies the column to sort by.
  - **Allowed Values:** `id`, `title`, `author`, `price`, `pages`.
  - **Default:** `id`.
  - **Error (400):** If an unapproved column is supplied.
- **`order`:** Specifies sort direction.
  - **Allowed Values:** `ASC`, `DESC` (case-insensitive).
  - **Default:** `ASC`.
  - **Error (400):** If an unapproved direction is supplied.
- **Example:**
  ```http
  GET /books?order_by=price&order=DESC
  ```

### 8.3 Price Filtering (`min_price` & `max_price`)
- **`min_price`:** Lower bound on price (`price >= ?`). Must be a non-negative number.
- **`max_price`:** Upper bound on price (`price <= ?`). Must be a non-negative number.
- **Range Validation:** If both are supplied, `min_price` must not be greater than `max_price`.
- **Example:**
  ```http
  GET /books?min_price=300&max_price=600
  ```

### 8.4 Pagination (`limit` & `offset`)
- **`limit`:** Maximum number of records to return. Must be a positive integer (`> 0`).
- **`offset`:** Number of records to skip. Must be a non-negative integer (`>= 0`).
- **Examples:**
  ```http
  GET /books?limit=3&offset=0
  GET /books?limit=3&offset=3
  ```

### 8.5 Combined Query Example
```http
GET /books?search_q=Java&min_price=400&max_price=700&order_by=price&order=ASC&limit=2&offset=0
```

---

## 9. Request and Response Examples

### 9.1 API Welcome Route
**Request:**
```http
GET / HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "message": "Welcome to the Bookstore REST API - Backend Development Fundamentals Lab 03",
  "version": "1.0.0",
  "status": "success",
  "endpoints": {
    "GET /": "API welcome information and documentation",
    "GET /books": "Get all books with optional search_q, min_price, max_price, order_by, order, limit, offset",
    "GET /books/:id": "Get a specific book by numeric ID",
    "POST /books": "Add a new book (requires title, author, price; optional pages)",
    "PUT /books/:id": "Update an existing book by ID",
    "DELETE /books/:id": "Delete a book by ID"
  }
}
```

---

### 9.2 Retrieve All Books
**Request:**
```http
GET /books HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "count": 12,
  "total": 12,
  "data": [
    {
      "id": 1,
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "price": 450,
      "pages": 416
    },
    {
      "id": 2,
      "title": "Java: The Complete Reference",
      "author": "Herbert Schildt",
      "price": 650,
      "pages": 1248
    }
  ]
}
```

---

### 9.3 Partial Search (`search_q=Java`)
**Request:**
```http
GET /books?search_q=Java HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "count": 3,
  "total": 3,
  "data": [
    {
      "id": 1,
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "price": 450,
      "pages": 416
    },
    {
      "id": 2,
      "title": "Java: The Complete Reference",
      "author": "Herbert Schildt",
      "price": 650,
      "pages": 1248
    },
    {
      "id": 3,
      "title": "Head First Java",
      "author": "Kathy Sierra",
      "price": 520,
      "pages": 720
    }
  ]
}
```

---

### 9.4 Sorting by Price Descending (`order_by=price&order=DESC`)
**Request:**
```http
GET /books?order_by=price&order=DESC HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "count": 12,
  "total": 12,
  "data": [
    {
      "id": 11,
      "title": "Artificial Intelligence: A Modern Approach",
      "author": "Stuart Russell and Peter Norvig",
      "price": 850,
      "pages": 1152
    },
    {
      "id": 10,
      "title": "Database System Concepts",
      "author": "Abraham Silberschatz",
      "price": 720,
      "pages": 1376
    },
    {
      "id": 2,
      "title": "Java: The Complete Reference",
      "author": "Herbert Schildt",
      "price": 650,
      "pages": 1248
    }
  ]
}
```

---

### 9.5 Price Range Filtering (`min_price=300&max_price=600`)
**Request:**
```http
GET /books?min_price=300&max_price=600 HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "count": 8,
  "total": 8,
  "data": [
    {
      "id": 1,
      "title": "Effective Java",
      "author": "Joshua Bloch",
      "price": 450,
      "pages": 416
    },
    {
      "id": 3,
      "title": "Head First Java",
      "author": "Kathy Sierra",
      "price": 520,
      "pages": 720
    },
    {
      "id": 4,
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "price": 480,
      "pages": 464
    }
  ]
}
```

---

### 9.6 Pagination (`limit=3&offset=0`)
**Request:**
```http
GET /books?limit=3&offset=0 HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "count": 3,
  "total": 12,
  "data": [
    { "id": 1, "title": "Effective Java", "author": "Joshua Bloch", "price": 450, "pages": 416 },
    { "id": 2, "title": "Java: The Complete Reference", "author": "Herbert Schildt", "price": 650, "pages": 1248 },
    { "id": 3, "title": "Head First Java", "author": "Kathy Sierra", "price": 520, "pages": 720 }
  ]
}
```

---

### 9.7 Retrieve Single Book by ID
**Request:**
```http
GET /books/1 HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Effective Java",
    "author": "Joshua Bloch",
    "price": 450,
    "pages": 416
  }
}
```

---

### 9.8 Add a New Book
**Request:**
```http
POST /books HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Designing Data-Intensive Applications",
  "author": "Martin Kleppmann",
  "price": 680.00,
  "pages": 616
}
```
**Response (`201 Created`):**
```json
{
  "status": "success",
  "message": "Book created successfully.",
  "data": {
    "id": 13,
    "title": "Designing Data-Intensive Applications",
    "author": "Martin Kleppmann",
    "price": 680,
    "pages": 616
  }
}
```

---

### 9.9 Update an Existing Book
**Request:**
```http
PUT /books/13 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "title": "Designing Data-Intensive Applications (Updated Edition)",
  "author": "Martin Kleppmann",
  "price": 720.00,
  "pages": 624
}
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Book updated successfully.",
  "data": {
    "id": 13,
    "title": "Designing Data-Intensive Applications (Updated Edition)",
    "author": "Martin Kleppmann",
    "price": 720,
    "pages": 624
  }
}
```

---

### 9.10 Delete a Book
**Request:**
```http
DELETE /books/13 HTTP/1.1
Host: localhost:3000
```
**Response (`200 OK`):**
```json
{
  "status": "success",
  "message": "Book with ID 13 deleted successfully."
}
```

---

## 10. Validation Rules and Error Responses

| Rule | Trigger Condition | Status Code | Error Message Payload |
|:---|:---|:---:|:---|
| **Missing Title** | Missing, empty string, or non-string in `POST` / `PUT` | `400` | `{"status": "error", "message": "Missing or invalid book title. Title is required and cannot be empty."}` |
| **Missing Author** | Missing, empty string, or non-string in `POST` / `PUT` | `400` | `{"status": "error", "message": "Missing or invalid author. Author is required and cannot be empty."}` |
| **Invalid Price** | Missing, NaN, or non-numeric value in `POST` / `PUT` | `400` | `{"status": "error", "message": "Invalid price. Price is required and must be a non-negative number."}` |
| **Negative Price** | `price < 0` in `POST` / `PUT` | `400` | `{"status": "error", "message": "Invalid price. Price is required and must be a non-negative number."}` |
| **Invalid Pages** | `pages !== null && (!Number.isInteger(pages) \|\| pages <= 0)` | `400` | `{"status": "error", "message": "Invalid pages. Pages must be a positive integer."}` |
| **Invalid Book ID** | `id` in route parameter is not a positive integer (e.g. `/books/abc` or `/books/-1`) | `400` | `{"status": "error", "message": "Invalid book ID. ID must be a positive integer."}` |
| **Invalid Sorting Column** | `order_by` not in `['id', 'title', 'author', 'price', 'pages']` | `400` | `{"status": "error", "message": "Invalid 'order_by' parameter: '<val>'. Allowed columns: id, title, author, price, pages."}` |
| **Invalid Sorting Order** | `order` not in `['ASC', 'DESC']` | `400` | `{"status": "error", "message": "Invalid 'order' parameter: '<val>'. Allowed values: ASC, DESC."}` |
| **Invalid Price Range** | `min_price > max_price` | `400` | `{"status": "error", "message": "Invalid price range. 'min_price' cannot be greater than 'max_price'."}` |
| **Invalid Pagination Limit** | `limit <= 0` or non-integer | `400` | `{"status": "error", "message": "Invalid 'limit' parameter. Must be a positive integer greater than 0."}` |
| **Invalid Pagination Offset**| `offset < 0` or non-integer | `400` | `{"status": "error", "message": "Invalid 'offset' parameter. Must be a non-negative integer."}` |
| **Malformed JSON** | Request body has syntax errors (e.g., missing closing bracket) | `400` | `{"status": "error", "message": "Malformed JSON payload in request body. Please verify your JSON syntax."}` |
| **Book Not Found** | Querying, updating, or deleting a non-existent ID | `404` | `{"status": "error", "message": "Book with ID <id> not found."}` |
| **Route Not Found** | Unrecognized HTTP method and path | `404` | `{"status": "error", "message": "Route '<METHOD> <PATH>' not found."}` |

---

## 11. HTTP Status Codes Explained

- **`200 OK`:** Returned for standard successful read, update, and delete operations (`GET /`, `GET /books`, `GET /books/:id`, `PUT /books/:id`, `DELETE /books/:id`).
- **`201 Created`:** Returned when a new book entity is successfully created and persisted via `POST /books`.
- **`400 Bad Request`:** Returned whenever client input fails validation rules (missing body fields, malformed JSON, out-of-bounds parameters, invalid query values).
- **`404 Not Found`:** Returned when a targeted resource ID does not exist in the database or an undefined endpoint URL is requested.
- **`500 Internal Server Error`:** Returned by the global error handler if an unexpected server exception or unhandled database driver failure occurs.

---

## 12. Debugging & Error Handling Architecture

The project features a defensive error-handling architecture:

1. **Port In-Use Detection (`EADDRINUSE`):**
   ```javascript
   server.on('error', (err) => {
     if (err.code === 'EADDRINUSE') {
       console.error(`[FATAL] Port ${PORT} is already in use.`);
       console.error(`[DEBUG TIP] Another process is using port ${PORT}. Stop that process or set PORT=<other_port> in your environment.`);
     }
     process.exit(1);
   });
   ```

2. **Malformed JSON Interception:**
   Catches `SyntaxError` from body parsing and responds with an explanatory `400` status before standard route handlers trigger.

3. **Graceful Shutdown:**
   Listens for `SIGINT` and `SIGTERM` signals to cleanly close database handles and pending HTTP socket connections without corrupting `books.db`.

4. **Parameterized SQL Queries:**
   All queries use `?` placeholders with parameter arrays (`[title, author, price, pages]`) preventing SQL injection.

5. **Sorting Column Whitelisting:**
   Dynamic SQL concatenation for sorting is guarded by an explicit whitelist array: `['id', 'title', 'author', 'price', 'pages']`.

---

## 13. Postman Testing Guide & Screenshot Evidence

To test this API in Postman and save evidence images into `screenshots/`, execute the following 11 requests:

| # | Test Scenario | HTTP Method | URL | Body / Notes | Target Filename | Status |
|:---:|:---|:---:|:---|:---|:---|:---:|
| 1 | Get All Books | `GET` | `http://localhost:3000/books` | None | [`get-all-books.png`](screenshots/get-all-books.png) | ✅ Completed |
| 2 | Search Query 'Java' | `GET` | `http://localhost:3000/books?search_q=Java` | None | [`search-query-java.png`](screenshots/search-query-java.png) | ✅ Completed |
| 3 | Sort by Price Descending | `GET` | `http://localhost:3000/books?order_by=price&order=DESC` | None | [`sort-by-price-desc.png`](screenshots/sort-by-price-desc.png) | ✅ Completed |
| 4 | Filter by Price Range | `GET` | `http://localhost:3000/books?min_price=300&max_price=600` | None | [`filter-by-price-range.png`](screenshots/filter-by-price-range.png) | ✅ Completed |
| 5 | Pagination Limit 3 Offset 0 | `GET` | `http://localhost:3000/books?limit=3&offset=0` | None | [`pagination-limit-3-offset-0.png`](screenshots/pagination-limit-3-offset-0.png) | ✅ Completed |
| 6 | Invalid Query Parameter | `GET` | `http://localhost:3000/books?order_by=invalid` | None (Expect `400 Bad Request`) | [`invalid-query-param.png`](screenshots/invalid-query-param.png) | ✅ Completed |
| 7 | POST Missing Title | `POST` | `http://localhost:3000/books` | `{"author": "Test Author", "price": 250, "pages": 200}` (Expect `400`) | [`post-missing-title.png`](screenshots/post-missing-title.png) | ✅ Completed |
| 8 | POST Invalid Price | `POST` | `http://localhost:3000/books` | `{"title": "Test Book", "author": "Test Author", "price": "invalid", "pages": 200}` (Expect `400`) | [`post-invalid-price.png`](screenshots/post-invalid-price.png) | ✅ Completed |
| 9 | GET Book Not Found | `GET` | `http://localhost:3000/books/99999` | None (Expect `404 Not Found`) | [`get-book-not-found.png`](screenshots/get-book-not-found.png) | ✅ Completed |
| 10 | POST Create Book | `POST` | `http://localhost:3000/books` | `{"title": "AI Engineering Fundamentals", "author": "K Adithya", "price": 499, "pages": 350}` (Expect `201`) | [`post-create-book.png`](screenshots/post-create-book.png) | ✅ Completed |
| 11 | DELETE Book | `DELETE` | `http://localhost:3000/books/1` | None (Expect `200 OK`) | [`delete-book.png`](screenshots/delete-book.png) | ✅ Completed |

### 13.1 DB Browser for SQLite Evidence

| # | Inspection Scenario | Evidence File | Observed State | Status |
|:---:|:---|:---|:---|:---:|
| 1 | Browse Data Table Verification | [`browse-data.png`](screenshots/db-browser/browse-data.png) | Shows 11 active book records (`id: 2` through `12`). Confirms record `id: 1` was permanently deleted. | ✅ Verified |
| 2 | Database Schema & Structure | `database-structure.png` | Shows `books` table schema (`id`, `title`, `author`, `price`, `pages`) with primary key and data types. | ⏳ Pending User Capture |

> **Note on Screenshot Evidence:**
> Per laboratory standards, screenshots must capture genuine responses directly from Postman without simulated or placeholder graphics. After performing the requests in Postman, save the captured UI responses as `.png` files in the `screenshots/` directory matching the exact filenames listed above.

---

## 14. Deployment Instructions

### Deployment to Render / Railway / Cloud Services

1. **Repository Setup:**
   Ensure `books.db` and `node_modules/` are not committed to source control (handled by `.gitignore`).
2. **Environment Variables:**
   - Configure `PORT` (e.g. `3000` or assigned by platform).
   - Configure `NODE_ENV=production`.
3. **Build & Start Commands:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Host Binding:**
   The server listens on `0.0.0.0` ensuring cloud reverse proxies (Render, Railway, Heroku, Docker) can route external traffic properly.

