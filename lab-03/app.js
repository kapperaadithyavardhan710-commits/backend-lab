const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware for parsing JSON bodies
app.use(express.json());

// Middleware for handling malformed JSON payloads
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Malformed JSON payload in request body. Please verify your JSON syntax.'
    });
  }
  next(err);
});

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[REQ] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ==========================================
// API Routes
// ==========================================

/**
 * GET /
 * API welcome information and directory of endpoints
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Bookstore REST API - Backend Development Fundamentals Lab 03',
    version: '1.0.0',
    status: 'success',
    endpoints: {
      'GET /': 'API welcome information and documentation',
      'GET /books': 'Get all books with optional search_q, min_price, max_price, order_by, order, limit, offset',
      'GET /books/:id': 'Get a specific book by numeric ID',
      'POST /books': 'Add a new book (requires title, author, price; optional pages)',
      'PUT /books/:id': 'Update an existing book by ID',
      'DELETE /books/:id': 'Delete a book by ID'
    }
  });
});

/**
 * GET /books
 * Get all books with support for:
 * - Search: search_q (partial match on title)
 * - Sorting: order_by (id, title, author, price, pages) & order (ASC, DESC)
 * - Price filtering: min_price & max_price
 * - Pagination: limit & offset
 */
app.get('/books', async (req, res, next) => {
  try {
    const { search_q, order_by, order, min_price, max_price, limit, offset } = req.query;

    // Validate sorting column
    const allowedColumns = ['id', 'title', 'author', 'price', 'pages'];
    let selectedOrderBy = 'id';
    if (order_by !== undefined) {
      if (!allowedColumns.includes(order_by.toLowerCase())) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid 'order_by' parameter: '${order_by}'. Allowed columns: ${allowedColumns.join(', ')}.`
        });
      }
      selectedOrderBy = order_by.toLowerCase();
    }

    // Validate sorting direction
    let selectedOrder = 'ASC';
    if (order !== undefined) {
      const upperOrder = order.toUpperCase();
      if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
        return res.status(400).json({
          status: 'error',
          message: `Invalid 'order' parameter: '${order}'. Allowed values: ASC, DESC.`
        });
      }
      selectedOrder = upperOrder;
    }

    // Validate price filtering
    if (min_price !== undefined) {
      const minNum = Number(min_price);
      if (isNaN(minNum) || minNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: "Invalid 'min_price' parameter. Must be a non-negative number."
        });
      }
    }

    if (max_price !== undefined) {
      const maxNum = Number(max_price);
      if (isNaN(maxNum) || maxNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: "Invalid 'max_price' parameter. Must be a non-negative number."
        });
      }
    }

    if (min_price !== undefined && max_price !== undefined) {
      if (Number(min_price) > Number(max_price)) {
        return res.status(400).json({
          status: 'error',
          message: "Invalid price range. 'min_price' cannot be greater than 'max_price'."
        });
      }
    }

    // Validate pagination
    if (limit !== undefined) {
      const limitNum = Number(limit);
      if (!Number.isInteger(limitNum) || limitNum <= 0) {
        return res.status(400).json({
          status: 'error',
          message: "Invalid 'limit' parameter. Must be a positive integer greater than 0."
        });
      }
    }

    if (offset !== undefined) {
      const offsetNum = Number(offset);
      if (!Number.isInteger(offsetNum) || offsetNum < 0) {
        return res.status(400).json({
          status: 'error',
          message: "Invalid 'offset' parameter. Must be a non-negative integer."
        });
      }
    }

    // Fetch filtered books from database
    const result = await db.getAllBooks({
      search_q,
      min_price,
      max_price,
      order_by: selectedOrderBy,
      order: selectedOrder,
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      count: result.books.length,
      total: result.total,
      data: result.books
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /books/:id
 * Retrieve a single book by ID
 */
app.get('/books/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid book ID. ID must be a positive integer.'
      });
    }

    const book = await db.getBookById(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: `Book with ID ${id} not found.`
      });
    }

    res.status(200).json({
      status: 'success',
      data: book
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /books
 * Add a new book
 */
app.post('/books', async (req, res, next) => {
  try {
    const { title, author, price, pages } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid book title. Title is required and cannot be empty.'
      });
    }

    // Validate author
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid author. Author is required and cannot be empty.'
      });
    }

    // Validate price
    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid price. Price is required and must be a non-negative number.'
      });
    }

    // Validate pages (optional, but must be positive integer if provided)
    if (pages !== undefined && pages !== null && (!Number.isInteger(pages) || pages <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pages. Pages must be a positive integer.'
      });
    }

    const newBook = await db.createBook({
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
      pages: pages !== undefined && pages !== null ? Number(pages) : null
    });

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully.',
      data: newBook
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /books/:id
 * Update an existing book by ID
 */
app.put('/books/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid book ID. ID must be a positive integer.'
      });
    }

    // Check if book exists
    const existingBook = await db.getBookById(id);
    if (!existingBook) {
      return res.status(404).json({
        status: 'error',
        message: `Book with ID ${id} not found.`
      });
    }

    const { title, author, price, pages } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid book title. Title is required and cannot be empty.'
      });
    }

    // Validate author
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid author. Author is required and cannot be empty.'
      });
    }

    // Validate price
    if (price === undefined || price === null || typeof price !== 'number' || isNaN(price) || price < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid price. Price is required and must be a non-negative number.'
      });
    }

    // Validate pages (optional, but must be positive integer if provided)
    if (pages !== undefined && pages !== null && (!Number.isInteger(pages) || pages <= 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pages. Pages must be a positive integer.'
      });
    }

    const updatedBook = await db.updateBook(id, {
      title: title.trim(),
      author: author.trim(),
      price: Number(price),
      pages: pages !== undefined && pages !== null ? Number(pages) : null
    });

    res.status(200).json({
      status: 'success',
      message: 'Book updated successfully.',
      data: updatedBook
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /books/:id
 * Delete a book by ID
 */
app.delete('/books/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid book ID. ID must be a positive integer.'
      });
    }

    // Check if book exists
    const existingBook = await db.getBookById(id);
    if (!existingBook) {
      return res.status(404).json({
        status: 'error',
        message: `Book with ID ${id} not found.`
      });
    }

    await db.deleteBook(id);

    res.status(200).json({
      status: 'success',
      message: `Book with ID ${id} deleted successfully.`
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 404 & Error Handling Middleware
// ==========================================

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route '${req.method} ${req.originalUrl}' not found.`
  });
});

// Global 500 error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR] Unhandled exception:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error. Please check server logs.'
  });
});

// ==========================================
// Server Startup & Initialization
// ==========================================

let server;

async function startServer() {
  try {
    // 1. Initialize SQLite database and seed records if needed
    console.log('[INIT] Initializing database...');
    await db.initDatabase();

    // 2. Start Express HTTP server
    server = app.listen(PORT, HOST, () => {
      console.log(`[INIT] Server running and listening on http://${HOST}:${PORT}`);
      console.log(`[INIT] Access API locally at http://localhost:${PORT}`);
    });

    // Handle port in use and other startup errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[FATAL] Port ${PORT} is already in use.`);
        console.error(`[DEBUG TIP] Another process is using port ${PORT}. Stop that process or set PORT=<other_port> in your environment.`);
      } else {
        console.error('[FATAL] Failed to start server:', err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('[FATAL] Error during application startup:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown(signal) {
  console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server and database...`);
  if (server) {
    server.close(() => {
      console.log('[SHUTDOWN] HTTP server closed.');
      db.closeDatabase()
        .then(() => {
          console.log('[SHUTDOWN] Application terminated cleanly.');
          process.exit(0);
        })
        .catch(() => process.exit(1));
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start application
if (require.main === module) {
  startServer();
}

module.exports = app;

