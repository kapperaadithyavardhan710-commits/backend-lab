# Backend Development Fundamentals – Course Labs

LINK: https://backend-lab-0l7m.onrender.com/

Welcome to the **Backend Development Fundamentals** laboratory repository. This repository organizes both **Lab 1** and **Lab 2** assignments into independent, modular project folders.

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
