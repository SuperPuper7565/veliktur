const http = require('http');

const app = require('../app');
const { initDatabase } = require('../db/initDb');

const run = async () => {
  await initDatabase();

  const server = app.listen(0, () => {
    const { port } = server.address();

    const request = (path) =>
      new Promise((resolve, reject) => {
        const req = http.request(
          {
            hostname: '127.0.0.1',
            port,
            path,
            method: 'GET'
          },
          (res) => {
            let body = '';
            res.on('data', (chunk) => {
              body += chunk;
            });
            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                body,
                headers: res.headers
              });
            });
          }
        );

        req.on('error', reject);
        req.end();
      });

    Promise.all([
      request('/'),
      request('/veliktur/'),
      request('/veliktur/api/products')
    ])
      .then(([rootRes, homeRes, apiRes]) => {
        if (rootRes.statusCode !== 302 || rootRes.headers.location !== '/veliktur/') {
          throw new Error('Root URL must redirect to /veliktur/');
        }

        if (homeRes.statusCode !== 200) {
          throw new Error('Home page /veliktur/ is unavailable');
        }

        if (apiRes.statusCode !== 200) {
          throw new Error('API /veliktur/api/products is unavailable');
        }

        const payload = JSON.parse(apiRes.body);
        if (!Array.isArray(payload.items) || payload.items.length === 0) {
          throw new Error('API returned an empty product list');
        }

        console.log('Smoke test passed');
      })
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      })
      .finally(() => {
        server.close();
      });
  });
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
