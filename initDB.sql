-- ============================================================
-- Database Initialization Script for Lab 2: Book Management API
-- Student: Abithya | Reg No: 252U1R9060 | Aurora
-- ============================================================

-- 1. Create 'book' table if it doesn't already exist
CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    pages INTEGER NOT NULL
);

-- 2. Insert 9 Realistic Sample Book Records
INSERT INTO book (title, author, price, pages) VALUES
('To Kill a Mockingbird', 'Harper Lee', 350, 281),
('1984', 'George Orwell', 299, 328),
('The Great Gatsby', 'F. Scott Fitzgerald', 250, 180),
('Pride and Prejudice', 'Jane Austen', 199, 279),
('The Catcher in the Rye', 'J.D. Salinger', 320, 234),
('The Hobbit', 'J.R.R. Tolkien', 450, 310),
('Fahrenheit 451', 'Ray Bradbury', 280, 249),
('The Alchemist', 'Paulo Coelho', 220, 208),
('Brave New World', 'Aldous Huxley', 310, 268);

