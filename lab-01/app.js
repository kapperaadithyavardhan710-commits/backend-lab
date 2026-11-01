// Express Server - Lab 1: Node.js and Express Server
// Student: KAPPERA ADITHYA VARDHAN (Reg No: 252U1R9060)

const express = require('express');
const app = express();

// Port configuration: use environment variable PORT or fallback to port 3000
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests (good practice)
app.use(express.json());

// 1. GET / - Return a welcome message
app.get('/', (req, res) => {
  res.status(200).send('Welcome to Lab 1: Node.js and Express Server!');
});

// 2. GET /about - Return JSON containing student name, section, and details
app.get('/about', (req, res) => {
  res.status(200).json({
    status: 'success',
    student: {
      name: 'KAPPERA ADITHYA VARDHAN',
      registrationNumber: '252U1R9060',
      course: 'Backend Development Fundamentals',
      branch: 'CSE – Gen AI',
      section: 'CSE – Gen AI',
      institution: 'Aurora',
      faculty: 'Joel Prashanth D'
    }
  });
});

// 3. GET /time - Return current server date and time using new Date()
app.get('/time', (req, res) => {
  const now = new Date();
  res.status(200).json({
    status: 'success',
    currentTime: now.toISOString(),
    humanReadableTime: now.toLocaleString(),
    timestamp: now.getTime()
  });
});

// 4. Unknown routes - Catch-all 404 handler returning JSON response
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl}. Route not found on this server.`
  });
});

// Start the Express server only when executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Express Server] Server running successfully on http://localhost:${PORT}`);
    console.log(`Available Endpoints:`);
    console.log(` - GET  http://localhost:${PORT}/`);
    console.log(` - GET  http://localhost:${PORT}/about`);
    console.log(` - GET  http://localhost:${PORT}/time`);
    console.log(`Press Ctrl+C to terminate.`);
  });
}

module.exports = app;

