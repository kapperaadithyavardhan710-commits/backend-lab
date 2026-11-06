# Backend Development Fundamentals – Course Labs

LINK: https://backend-lab-0l7m.onrender.com/

Welcome to the **Backend Development Fundamentals** laboratory repository. This repository organizes **Lab 1**, **Lab 2**, and **Lab 3** assignments into independent, modular project folders.

---

## Student Information

| Field | Details |
| :--- | :--- |
| **Student Name** | KAPPERA ADITHYA VARDHAN |
| **Registration Number** | 252U1R9060 |
| **Course** | Backend Development Fundamentals |
| **Branch** | CSE – Gen AI |
| **Institution** | Aurora |
| **Faculty** | Joel Prashanth D |
| **GitHub Repository** | [backend-lab](https://github.com/kapperaadithyavardhan710-commits/backend-lab) |

---

## Repository Structure

```text
backend-lab/
│
├── lab-01/                               # Lab 1: Node.js & Express Server
│   ├── app.js                           # Express server with route definitions & 404 handler
│   ├── plain-server.js                  # Plain Node.js HTTP server (built-in http module)
│   ├── http-server.js                   # HTTP demonstration server
│   ├── package.json                     # Node project manifest
│   ├── package-lock.json                # Dependency lockfile
│   ├── test-servers.js                  # Automated endpoint verification
│   ├── .gitignore                       # Local ignore rules
│   ├── README.md                        # Complete Lab 1 documentation & report
│   └── screenshots/                     # Verified response captures
│
├── lab-02/                               # Lab 2: SQLite Database & CRUD Operations
│   ├── app.js                           # Express server with async SQLite connection & CRUD APIs
│   ├── database.db                      # SQLite database file (9 seeded records)
│   ├── initDB.sql                       # Database schema and seed queries
│   ├── package.json                     # Node project manifest
│   ├── package-lock.json                # Dependency lockfile
│   ├── test-api.js                      # Automated 23-assertion test suite
│   ├── .gitignore                       # Local ignore rules
│   ├── README.md                        # Complete Lab 2 documentation & report
│   └── screenshots/                     # Postman & SQLite CLI verification captures
│       ├── get-all-books.png
│       ├── get-book-by-id.png
│       ├── post-add-book.png
│       ├── put-update-book.png
│       ├── delete-book.png
│       └── database-verification.png
│
├── lab-03/                               # Lab 3: REST API, Query Parameters, Validation & Debugging
│   ├── app.js                           # Express server with query filtering, sorting, pagination & validators
│   ├── database.js                      # Parameterized SQLite query methods & auto-seed
│   ├── initDB.sql                       # Database schema and 12-record seed queries
│   ├── package.json                     # Node project manifest
│   ├── package-lock.json                # Dependency lockfile
│   ├── render.yaml                      # Render Infrastructure-as-Code deployment config
│   ├── .gitignore                       # Local ignore rules
│   ├── README.md                        # Complete Lab 3 documentation & report
│   └── screenshots/                     # 11 Postman screenshots + DB Browser captures
│       ├── get-all-books.png
│       ├── search-query-java.png
│       ├── sort-by-price-desc.png
│       ├── filter-by-price-range.png
│       ├── pagination-limit-3-offset-0.png
│       ├── invalid-query-param.png
│       ├── post-missing-title.png
│       ├── post-invalid-price.png
│       ├── get-book-not-found.png
│       ├── post-create-book.png
│       ├── delete-book.png
│       └── db-browser/
│           └── browse-data.png
│
├── .gitignore                            # Root repository ignore rules
└── README.md                             # Main repository documentation
```

---

## Assignments Overview

### 📘 [Lab 1: Node.js and Express Server](./lab-01/)
- **Directory:** [`./lab-01/`](./lab-01/)
- **Core Focus:** Building web servers using both Node.js native `http` module and the Express.js framework.
- **Key Endpoints:**
  - `GET /` &rarr; Welcome message (`200 OK`)
  - `GET /about` &rarr; Student details in JSON (`200 OK`)
  - `GET /time` &rarr; Dynamic ISO and local date/time (`200 OK`)
  - `Catch-All` &rarr; Structured JSON 404 handler (`404 Not Found`)
- **Documentation:** See [`./lab-01/README.md`](./lab-01/README.md) for full endpoint tables, request/response examples, and viva questions.

---

### 📚 [Lab 2: SQLite Database and CRUD Operations](./lab-02/)
- **Directory:** [`./lab-02/`](./lab-02/)
- **Core Focus:** Connecting Express to an embedded SQLite database (`database.db`) using the `sqlite` Promise wrapper and `sqlite3` driver.
- **CRUD Operations:**
  - `GET /books/` &rarr; Fetch all 9 seeded books (`200 OK`)
  - `GET /books/:bookId/` &rarr; Retrieve single book by ID (`200 OK` or `404`)
  - `POST /books/` &rarr; Add new book with payload validation (`201 Created`)
  - `PUT /books/:bookId/` &rarr; Update existing book details (`200 OK` or `404`)
  - `DELETE /books/:bookId/` &rarr; Remove book from database (`200 OK` or `404`)
- **Features:** Parameterized queries (`?`), idempotent initial seeding, comprehensive Postman test suite.
- **Documentation:** See [`./lab-02/README.md`](./lab-02/README.md) for detailed schema, Postman guides, and DB Browser verification.

---

### 📖 [Lab 3: REST API, Query Parameters, Validation & Debugging](./lab-03/)
- **Directory:** [`./lab-03/`](./lab-03/)
- **Core Focus:** Advanced RESTful query parameters (partial text search, column sorting, price range filtering, limit/offset pagination), strict request body/param validation, defensive error handling, and SQLite integration.
- **Key Features:**
  - Dynamic composable query filtering (`search_q`, `order_by`, `order`, `min_price`, `max_price`, `limit`, `offset`)
  - Whitelist-guarded SQL sorting and parameterized queries (`?`) preventing SQL injection
  - Informative HTTP status code semantics (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`)
  - DB Browser for SQLite verification and 11 Postman evidence captures
- **Documentation:** See [`./lab-03/README.md`](./lab-03/README.md) for full endpoint specifications, validation payload catalog, and verification screenshots.

---

## Quick Start & Installation

### Running Lab 1
```bash
cd lab-01
npm install
npm start
# or npm run start:http
```

### Running Lab 2
```bash
cd lab-02
npm install
npm start
# or npm run dev
# or npm test
```

### Running Lab 3
```bash
cd lab-03
npm install
npm start
# or npm run dev
```
