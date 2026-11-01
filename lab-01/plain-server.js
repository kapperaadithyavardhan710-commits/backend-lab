// Plain Node.js HTTP Server demonstration
// Built using Node.js core 'http' module without any external framework

const http = require('http');

// Define port with environment variable support, defaulting to 3000
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  // Set response HTTP header with 200 OK status and text/plain content type
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  
  // Return "Hello" as the response body
  res.end('Hello');
});

// Start listening for incoming connections
server.listen(PORT, () => {
  console.log(`[Plain HTTP Server] Running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server.`);
});

