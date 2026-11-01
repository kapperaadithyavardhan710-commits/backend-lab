// ==============================================================================
// Lab 2: SQLite Database and CRUD Operations Using Node.js and Express
// Student Name: Abithya | Reg No: 252U1R9060 | Course: CSE – Gen AI | Aurora
// ==============================================================================

const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Path to the SQLite database file
const dbPath = path.join(__dirname, "database.db");

// Global database instance
let db = null;

// Server port configuration: use environment variable PORT or fallback to 3000
const PORT = process.env.PORT || 3000;

// Sample 9 realistic books to seed when the table is newly created and empty
const sampleBooks = [
  { title: "To Kill a Mockingbird", author: "Harper Lee", price: 350, pages: 281 },
  { title: "1984", author: "George Orwell", price: 299, pages: 328 },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 250, pages: 180 },
  { title: "Pride and Prejudice", author: "Jane Austen", price: 199, pages: 279 },
  { title: "The Catcher in the Rye", author: "J.D. Salinger", price: 320, pages: 234 },
  { title: "The Hobbit", author: "J.R.R. Tolkien", price: 450, pages: 310 },
  { title: "Fahrenheit 451", author: "Ray Bradbury", price: 280, pages: 249 },
  { title: "The Alchemist", author: "Paulo Coelho", price: 220, pages: 208 },
  { title: "Brave New World", author: "Aldous Huxley", price: 310, pages: 268 }
];

// Asynchronous function to initialize Database connection and start the Server
const initializeDBAndServer = async () => {
  try {
    // 1. Open the SQLite database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    console.log("Connected to the SQLite database successfully.");

    // 2. Ensure the 'book' table exists
    await db.run(`
      CREATE TABLE IF NOT EXISTS book (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price INTEGER NOT NULL,
        pages INTEGER NOT NULL
      );
    `);

    // 3. Check if table is empty; insert initial 9 records ONLY if count is 0
    // This preserves existing records on restart and prevents duplicate seeding
    const rowCount = await db.get("SELECT COUNT(*) AS count FROM book;");
    if (rowCount.count === 0) {
      console.log("Database table 'book' is empty. Seeding initial 9 sample books...");
      const insertQuery = `
        INSERT INTO book (title, author, price, pages)
        VALUES (?, ?, ?, ?);
      `;
      for (const book of sampleBooks) {
        await db.run(insertQuery, [book.title, book.author, book.price, book.pages]);
      }
      console.log("Initial sample books seeded successfully.");
    } else {
      console.log(`Database ready. Current book count: ${rowCount.count}.`);
    }

    // 4. Start the Express server only AFTER database connection is ready
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
      console.log(`Available Endpoints:`);
      console.log(` - GET    http://localhost:${PORT}/books/`);
      console.log(` - GET    http://localhost:${PORT}/books/:bookId/`);
      console.log(` - POST   http://localhost:${PORT}/books/`);
      console.log(` - PUT    http://localhost:${PORT}/books/:bookId/`);
      console.log(` - DELETE http://localhost:${PORT}/books/:bookId/`);
    });
  } catch (error) {
    console.error(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

// Start initialization
initializeDBAndServer();

// ==========================================
// ROOT ROUTE
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Lab 2: SQLite Database and CRUD Operations API",
    student: {
      name: "Abithya",
      registrationNumber: "252U1R9060",
      course: "CSE – Gen AI",
      institution: "Aurora"
    },
    documentation: {
      getAllBooks: "GET /books/",
      getBookById: "GET /books/:bookId/",
      addBook: "POST /books/",
      updateBook: "PUT /books/:bookId/",
      deleteBook: "DELETE /books/:bookId/"
    }
  });
});

// ==========================================
// CRUD ROUTES FOR BOOKS
// ==========================================

// 1. GET ALL BOOKS
// Endpoint: GET /books/
// Purpose: Fetch all book records from the database
app.get("/books/", async (request, response) => {
  try {
    const getBooksQuery = `
      SELECT
        *
      FROM
        book
      ORDER BY
        id ASC;
    `;
    const booksArray = await db.all(getBooksQuery);
    response.status(200).json(booksArray);
  } catch (error) {
    console.error("Error fetching books:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. GET SINGLE BOOK BY ID
// Endpoint: GET /books/:bookId/
// Purpose: Fetch a specific book record using its unique ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Parameterized query using '?' placeholder to prevent SQL Injection
    const getBookQuery = `
      SELECT
        *
      FROM
        book
      WHERE
        id = ?;
    `;

    const book = await db.get(getBookQuery, [bookId]);

    // Check if the book was found
    if (book === undefined) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json(book);
    }
  } catch (error) {
    console.error("Error fetching book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 3. POST (CREATE) A NEW BOOK
// Endpoint: POST /books/
// Purpose: Add a new book to the database
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    // Input validation
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "All fields (title, author, price, pages) are required",
      });
    }

    // Parameterized query using '?' placeholders to prevent SQL Injection
    const addBookQuery = `
      INSERT INTO
        book (title, author, price, pages)
      VALUES
        (?, ?, ?, ?);
    `;

    const dbResponse = await db.run(addBookQuery, [
      title,
      author,
      price,
      pages,
    ]);

    // Return 201 Created status with the newly generated book ID and book object
    response.status(201).json({
      message: "Book Added Successfully",
      bookId: dbResponse.lastID,
      book: {
        id: dbResponse.lastID,
        title,
        author,
        price,
        pages,
      },
    });
  } catch (error) {
    console.error("Error creating book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 4. PUT (UPDATE) AN EXISTING BOOK
// Endpoint: PUT /books/:bookId/
// Purpose: Update all fields of an existing book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    // Input validation
    if (!title || !author || price === undefined || pages === undefined) {
      return response.status(400).json({
        error: "All fields (title, author, price, pages) are required",
      });
    }

    // Parameterized query using '?' placeholders to prevent SQL Injection
    const updateBookQuery = `
      UPDATE
        book
      SET
        title = ?,
        author = ?,
        price = ?,
        pages = ?
      WHERE
        id = ?;
    `;

    const dbResponse = await db.run(updateBookQuery, [
      title,
      author,
      price,
      pages,
      bookId,
    ]);

    // If changes === 0, the bookId does not exist
    if (dbResponse.changes === 0) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json({
        message: "Book Updated Successfully",
        bookId: Number(bookId),
        book: {
          id: Number(bookId),
          title,
          author,
          price,
          pages
        }
      });
    }
  } catch (error) {
    console.error("Error updating book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 5. DELETE A BOOK
// Endpoint: DELETE /books/:bookId/
// Purpose: Remove a book record by its ID
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    // Parameterized query using '?' placeholder to prevent SQL Injection
    const deleteBookQuery = `
      DELETE FROM
        book
      WHERE
        id = ?;
    `;

    const dbResponse = await db.run(deleteBookQuery, [bookId]);

    // If changes === 0, the bookId does not exist
    if (dbResponse.changes === 0) {
      response.status(404).json({ error: "Book not found" });
    } else {
      response.status(200).json({ message: "Book Deleted Successfully" });
    }
  } catch (error) {
    console.error("Error deleting book:", error.message);
    response.status(500).json({ error: "Internal Server Error" });
  }
});

// 6. 404 CATCH-ALL FOR UNKNOWN ROUTES
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl}. Route not found on this server.`
  });
});

module.exports = app;

