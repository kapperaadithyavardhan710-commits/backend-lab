const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'books.db');

// Sample seed data to insert if database is empty
const SEED_BOOKS = [
  { title: 'Effective Java', author: 'Joshua Bloch', price: 450.00, pages: 416 },
  { title: 'Java: The Complete Reference', author: 'Herbert Schildt', price: 650.00, pages: 1248 },
  { title: 'Head First Java', author: 'Kathy Sierra', price: 520.00, pages: 720 },
  { title: 'Clean Code', author: 'Robert C. Martin', price: 480.00, pages: 464 },
  { title: 'Design Patterns: Elements of Reusable Object-Oriented Software', author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', price: 550.00, pages: 395 },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt and David Thomas', price: 499.00, pages: 352 },
  { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', price: 320.00, pages: 176 },
  { title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', price: 380.00, pages: 472 },
  { title: 'Learning Python', author: 'Mark Lutz', price: 590.00, pages: 1648 },
  { title: 'Database System Concepts', author: 'Abraham Silberschatz', price: 720.00, pages: 1376 },
  { title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell and Peter Norvig', price: 850.00, pages: 1152 },
  { title: 'Introduction to the Theory of Computation', author: 'Michael Sipser', price: 620.00, pages: 504 }
];

// Open SQLite database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error(`[DB ERROR] Failed to connect to SQLite database at ${DB_PATH}:`, err.message);
  } else {
    console.log(`[DB INFO] Successfully connected to SQLite database: ${path.basename(DB_PATH)}`);
  }
});

// Helper for db.run returning a Promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper for db.get returning a Promise
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper for db.all returning a Promise
function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Initialize SQLite database tables and seed sample data if table is empty.
 * Ensures duplicate records are avoided.
 */
async function initDatabase() {
  try {
    // 1. Create table if it doesn't exist
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        pages INTEGER
      )
    `;
    await runQuery(createTableSQL);
    console.log("[DB INFO] Table 'books' verified / created successfully.");

    // 2. Check existing record count
    const countResult = await getQuery("SELECT COUNT(*) AS count FROM books");
    const count = countResult ? countResult.count : 0;

    if (count === 0) {
      console.log("[DB INFO] 'books' table is empty. Seeding initial data...");

      // Use a transaction or sequential parameterized inserts
      for (const book of SEED_BOOKS) {
        await runQuery(
          "INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)",
          [book.title, book.author, book.price, book.pages]
        );
      }
      console.log(`[DB INFO] Successfully seeded ${SEED_BOOKS.length} books into database.`);
    } else {
      console.log(`[DB INFO] Database already contains ${count} books. Skipping seed to prevent duplicates.`);
    }
  } catch (err) {
    console.error("[DB ERROR] Error during database initialization:", err.message);
    throw err;
  }
}

/**
 * Fetch books with optional search, price filtering, sorting, and pagination.
 */
async function getAllBooks({ search_q, min_price, max_price, order_by = 'id', order = 'ASC', limit, offset }) {
  const whereClauses = [];
  const params = [];

  // Search by title (partial matching)
  if (search_q !== undefined && search_q !== null && search_q.trim() !== '') {
    whereClauses.push("title LIKE ?");
    params.push(`%${search_q.trim()}%`);
  }

  // Price range filtering
  if (min_price !== undefined && min_price !== null && min_price !== '') {
    whereClauses.push("price >= ?");
    params.push(Number(min_price));
  }

  if (max_price !== undefined && max_price !== null && max_price !== '') {
    whereClauses.push("price <= ?");
    params.push(Number(max_price));
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Whitelist-validated column and direction
  const orderSQL = `ORDER BY ${order_by} ${order}`;

  // Pagination
  let paginationSQL = "";
  const queryParams = [...params];

  if (limit !== undefined && limit !== null && limit !== '') {
    paginationSQL += " LIMIT ?";
    queryParams.push(Number(limit));

    if (offset !== undefined && offset !== null && offset !== '') {
      paginationSQL += " OFFSET ?";
      queryParams.push(Number(offset));
    }
  } else if (offset !== undefined && offset !== null && offset !== '') {
    // In SQLite, OFFSET requires LIMIT; use -1 for unbounded limit
    paginationSQL += " LIMIT -1 OFFSET ?";
    queryParams.push(Number(offset));
  }

  const sql = `SELECT * FROM books ${whereSQL} ${orderSQL} ${paginationSQL}`.trim();
  const rows = await allQuery(sql, queryParams);

  // Also query total matching count for rich API metadata
  const countSQL = `SELECT COUNT(*) AS total FROM books ${whereSQL}`.trim();
  const countResult = await getQuery(countSQL, params);
  const total = countResult ? countResult.total : rows.length;

  return { books: rows, total };
}

/**
 * Fetch a single book by ID
 */
async function getBookById(id) {
  return await getQuery("SELECT * FROM books WHERE id = ?", [id]);
}

/**
 * Create a new book
 */
async function createBook({ title, author, price, pages }) {
  const result = await runQuery(
    "INSERT INTO books (title, author, price, pages) VALUES (?, ?, ?, ?)",
    [title, author, price, pages !== undefined ? pages : null]
  );
  return {
    id: result.lastID,
    title,
    author,
    price,
    pages: pages !== undefined ? pages : null
  };
}

/**
 * Update an existing book by ID
 */
async function updateBook(id, { title, author, price, pages }) {
  await runQuery(
    "UPDATE books SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?",
    [title, author, price, pages !== undefined ? pages : null, id]
  );
  return {
    id: Number(id),
    title,
    author,
    price,
    pages: pages !== undefined ? pages : null
  };
}

/**
 * Delete a book by ID
 */
async function deleteBook(id) {
  const result = await runQuery("DELETE FROM books WHERE id = ?", [id]);
  return result.changes;
}

/**
 * Close database connection
 */
function closeDatabase() {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.error("[DB ERROR] Error closing database:", err.message);
        reject(err);
      } else {
        console.log("[DB INFO] SQLite database connection closed.");
        resolve();
      }
    });
  });
}

module.exports = {
  db,
  initDatabase,
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  closeDatabase
};

