// ==============================================================================
// Automated Test Suite for Lab 2: SQLite Book Management API
// Student: Abithya | Reg No: 252U1R9060
// ==============================================================================

const http = require("http");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const TEST_PORT = 3002;
process.env.PORT = TEST_PORT;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("====================================================");
  console.log("Starting Lab 2 Comprehensive Verification Tests");
  console.log("====================================================\n");

  // Require app.js to initialize DB and server
  require("./app");

  // Give the server 1.5 seconds to open DB and bind port
  await new Promise((r) => setTimeout(r, 1500));

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // Test 1: GET /books/
    console.log("\n--- Testing GET /books/ ---");
    const allBooksRes = await makeRequest("GET", "/books/");
    assert(allBooksRes.status === 200, "GET /books/ returns status 200 OK");
    assert(Array.isArray(allBooksRes.data), "GET /books/ returns an array");
    assert(allBooksRes.data.length >= 9, `Contains initial sample books (Found: ${allBooksRes.data.length})`);
    console.log(`Initial book count: ${allBooksRes.data.length}`);

    // Test 2: GET /books/:bookId/ (Existing)
    console.log("\n--- Testing GET /books/1/ ---");
    const book1Res = await makeRequest("GET", "/books/1/");
    assert(book1Res.status === 200, "GET /books/1/ returns status 200 OK");
    assert(book1Res.data.id === 1, "Book 1 has ID = 1");
    assert(book1Res.data.title === "To Kill a Mockingbird" || book1Res.data.title === "Clean Code Second Edition", "Book 1 title is present and valid");

    // Test 3: GET /books/:bookId/ (Non-existent -> 404)
    console.log("\n--- Testing GET /books/999/ (404 check) ---");
    const book404Res = await makeRequest("GET", "/books/999/");
    assert(book404Res.status === 404, "GET /books/999/ returns status 404 Not Found");
    assert(book404Res.data.error === "Book not found", "Returns proper 404 error message");

    // Test 4: POST /books/ (Create Book)
    console.log("\n--- Testing POST /books/ ---");
    const newBookPayload = {
      title: "Clean Code",
      author: "Robert C. Martin",
      price: 450,
      pages: 464,
    };
    const postRes = await makeRequest("POST", "/books/", newBookPayload);
    assert(postRes.status === 201, "POST /books/ returns status 201 Created");
    assert(postRes.data.bookId !== undefined, `Returns created bookId: ${postRes.data.bookId}`);
    assert(postRes.data.book.title === "Clean Code", "Returns newly created book title");
    const createdId = postRes.data.bookId;

    // Test 5: Verify newly created book via GET
    console.log(`\n--- Verifying Created Book via GET /books/${createdId}/ ---`);
    const verifyPostRes = await makeRequest("GET", `/books/${createdId}/`);
    assert(verifyPostRes.status === 200, `GET /books/${createdId}/ returns status 200 OK`);
    assert(verifyPostRes.data.title === "Clean Code", "Persisted title matches");
    assert(verifyPostRes.data.price === 450, "Persisted price matches");

    // Test 6: PUT /books/:bookId/ (Update Book)
    console.log(`\n--- Testing PUT /books/${createdId}/ ---`);
    const updatePayload = {
      title: "Clean Code Second Edition",
      author: "Robert C. Martin",
      price: 499,
      pages: 480,
    };
    const putRes = await makeRequest("PUT", `/books/${createdId}/`, updatePayload);
    assert(putRes.status === 200, `PUT /books/${createdId}/ returns status 200 OK`);

    // Test 7: Verify updated book
    const verifyPutRes = await makeRequest("GET", `/books/${createdId}/`);
    assert(verifyPutRes.data.title === "Clean Code Second Edition", "Updated title matches");
    assert(verifyPutRes.data.price === 499, "Updated price matches");
    assert(verifyPutRes.data.pages === 480, "Updated pages matches");

    // Test 8: PUT on non-existent book -> 404
    console.log("\n--- Testing PUT /books/999/ (404 check) ---");
    const put404Res = await makeRequest("PUT", "/books/999/", updatePayload);
    assert(put404Res.status === 404, "PUT /books/999/ returns status 404 Not Found");

    // Test 9: DELETE /books/:bookId/
    console.log(`\n--- Testing DELETE /books/${createdId}/ ---`);
    const deleteRes = await makeRequest("DELETE", `/books/${createdId}/`);
    assert(deleteRes.status === 200, `DELETE /books/${createdId}/ returns status 200 OK`);

    // Test 10: Verify deletion via GET -> 404
    console.log(`\n--- Verifying Deleted Book Returns 404 ---`);
    const verifyDeleteRes = await makeRequest("GET", `/books/${createdId}/`);
    assert(verifyDeleteRes.status === 404, `GET /books/${createdId}/ returns 404 after deletion`);

    // Test 11: DELETE already deleted book -> 404
    const deleteAgainRes = await makeRequest("DELETE", `/books/${createdId}/`);
    assert(deleteAgainRes.status === 404, "DELETE already deleted book returns 404 Not Found");

    // Test 12: Direct SQLite File Verification
    console.log("\n--- Direct SQLite Database Verification ---");
    const db = await open({
      filename: path.join(__dirname, "database.db"),
      driver: sqlite3.Database,
    });
    const directCount = await db.get("SELECT COUNT(*) AS count FROM book;");
    assert(directCount.count === 9, `Database contains exactly 9 original books after cleanup (Found: ${directCount.count})`);
    await db.close();

    console.log("\n====================================================");
    console.log(`All ${passed}/${total} Lab 2 Tests Passed Successfully!`);
    console.log("====================================================");
    process.exit(0);
  } catch (err) {
    console.error("\n[TEST FAILED]:", err.message);
    process.exit(1);
  }
}

runTests();

