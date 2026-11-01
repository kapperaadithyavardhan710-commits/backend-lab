// Automated Verification Test for Lab 1
const http = require('http');

async function testHttpServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Hello');
    });

    server.listen(4001, '127.0.0.1', () => {
      http.get('http://127.0.0.1:4001', (res) => {
        let body = '';
        res.on('data', chunk => (body += chunk));
        res.on('end', () => {
          server.close(() => {
            console.log('--- Plain Node.js HTTP Server ---');
            console.log(`Endpoint: GET http://127.0.0.1:4001/`);
            console.log(`Status Code: ${res.statusCode} (Expected: 200)`);
            console.log(`Response Body: "${body}" (Expected: "Hello")`);
            if (res.statusCode === 200 && body === 'Hello') {
              console.log('✓ Plain HTTP Server test PASSED\n');
              resolve();
            } else {
              reject(new Error('Plain HTTP Server test failed'));
            }
          });
        });
      }).on('error', reject);
    });
  });
}

async function testExpressServer() {
  const app = require('./app');
  return new Promise((resolve, reject) => {
    const server = app.listen(4002, '127.0.0.1', async () => {
      console.log('--- Express Server Endpoints ---');

      // Helper function to test an endpoint
      const checkEndpoint = (path) => {
        return new Promise((resEndpoint, rejEndpoint) => {
          http.get(`http://127.0.0.1:4002${path}`, (res) => {
            let data = '';
            res.on('data', chunk => (data += chunk));
            res.on('end', () => {
              resEndpoint({ status: res.statusCode, data });
            });
          }).on('error', rejEndpoint);
        });
      };

      try {
        // Test 1: GET /
        const resRoot = await checkEndpoint('/');
        console.log(`GET / -> Status: ${resRoot.status}, Body: ${resRoot.data}`);
        if (resRoot.status !== 200) throw new Error('GET / did not return 200');

        // Test 2: GET /about
        const resAbout = await checkEndpoint('/about');
        console.log(`GET /about -> Status: ${resAbout.status}, Body: ${resAbout.data}`);
        if (resAbout.status !== 200) throw new Error('GET /about did not return 200');
        const parsedAbout = JSON.parse(resAbout.data);
        if (!parsedAbout.student || !parsedAbout.student.name) {
          throw new Error('GET /about response missing student data');
        }

        // Test 3: GET /time
        const resTime = await checkEndpoint('/time');
        console.log(`GET /time -> Status: ${resTime.status}, Body: ${resTime.data}`);
        if (resTime.status !== 200) throw new Error('GET /time did not return 200');
        const parsedTime = JSON.parse(resTime.data);
        if (!parsedTime.currentTime) {
          throw new Error('GET /time response missing currentTime');
        }

        // Test 4: GET /unknown-path (404)
        const res404 = await checkEndpoint('/non-existent-route');
        console.log(`GET /non-existent-route -> Status: ${res404.status}, Body: ${res404.data}`);
        if (res404.status !== 404) throw new Error('Unknown route did not return 404');
        const parsed404 = JSON.parse(res404.data);
        if (parsed404.statusCode !== 404) {
          throw new Error('404 JSON response missing statusCode 404');
        }

        console.log('\n✓ All Express endpoints and 404 handler PASSED');
        server.close(resolve);
      } catch (err) {
        server.close();
        reject(err);
      }
    });
  });
}

async function run() {
  try {
    await testHttpServer();
    await testExpressServer();
    console.log('\n==========================================');
    console.log('✓ ALL TESTS PASSED SUCCESSFULLY!');
    console.log('==========================================');
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

run();

