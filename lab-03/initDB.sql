-- Backend Development Fundamentals - Lab 03
-- Database Initialization Schema and Seed Data

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  price REAL NOT NULL,
  pages INTEGER
);

-- Seed sample books (At least 10 records)
INSERT INTO books (title, author, price, pages) VALUES
  ('Effective Java', 'Joshua Bloch', 450.00, 416),
  ('Java: The Complete Reference', 'Herbert Schildt', 650.00, 1248),
  ('Head First Java', 'Kathy Sierra', 520.00, 720),
  ('Clean Code', 'Robert C. Martin', 480.00, 464),
  ('Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 550.00, 395),
  ('The Pragmatic Programmer', 'Andrew Hunt and David Thomas', 499.00, 352),
  ('JavaScript: The Good Parts', 'Douglas Crockford', 320.00, 176),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 380.00, 472),
  ('Learning Python', 'Mark Lutz', 590.00, 1648),
  ('Database System Concepts', 'Abraham Silberschatz', 720.00, 1376),
  ('Artificial Intelligence: A Modern Approach', 'Stuart Russell and Peter Norvig', 850.00, 1152),
  ('Introduction to the Theory of Computation', 'Michael Sipser', 620.00, 504);

