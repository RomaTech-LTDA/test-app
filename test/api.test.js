'use strict';

// Boots the controllers the same way src/server.ts does (minus Swagger/MCP)
// and exercises the HTTP API end to end.
require('reflect-metadata');
require('@romatech/linq');
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { useController } = require('@romatech/ai-extensions');
const { UserController } = require('../dist/controllers/UserController');
const { ProductController } = require('../dist/controllers/ProductController');
const { AppDbContext } = require('../dist/context/AppDbContext');
const { seedDatabase } = require('../dist/context/seed');

let server;
let baseUrl;

before(async () => {
  const app = express();
  app.use(express.json());
  useController(app, UserController);
  useController(app, ProductController);
  await seedDatabase(new AppDbContext());
  await new Promise(resolve => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise(resolve => server.close(resolve)));

async function call(method, path, body) {
  const res = await fetch(baseUrl + path, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : undefined };
}

test('controllers see the data seeded at startup (one shared database)', async () => {
  const users = await call('GET', '/users');
  assert.equal(users.status, 200);
  assert.equal(users.body.length, 5);
  assert.equal((await call('GET', '/products/1')).status, 200);
});

test('GET /products/search is reachable (not captured by /products/:id)', async () => {
  const res = await call('GET', '/products/search?minPrice=400&pageSize=50');
  assert.equal(res.status, 200);
  assert.ok(res.body.items.every(p => p.price >= 400));
  assert.equal(res.body.total, res.body.items.length);
});

test('POST generates an id when none is given and rejects duplicates', async () => {
  const created = await call('POST', '/users', { name: 'New', email: 'new@example.com', age: 40 });
  assert.equal(created.status, 201);
  assert.ok(Number.isInteger(created.body.id));
  assert.equal((await call('GET', `/users/${created.body.id}`)).status, 200);

  const duplicate = await call('POST', '/users', { id: 1, name: 'Dup', email: 'dup@example.com', age: 1 });
  assert.equal(duplicate.status, 409);
});

test('PUT cannot change the id through the body', async () => {
  const res = await call('PUT', '/users/2', { id: 99, name: 'Renamed' });
  assert.equal(res.status, 200);
  assert.equal(res.body.id, 2);
  assert.equal(res.body.name, 'Renamed');
  assert.equal((await call('GET', '/users/99')).status, 404);
});

test('POST and PUT reject invalid values without touching the stored entity', async () => {
  for (const body of [{ price: 'abc' }, { price: { $gt: 0 } }, { price: -1 }, { stock: 1.5 }, { name: '' }, { name: { a: 1 } }]) {
    const res = await call('PUT', '/products/1', body);
    assert.equal(res.status, 400, JSON.stringify(body));
  }
  const product = (await call('GET', '/products/1')).body;
  assert.ok(Number.isFinite(product.price) && typeof product.name === 'string' && product.name !== '');

  assert.equal((await call('PUT', '/users/3', { name: 'Ok', age: 'NaN' })).status, 400);
  assert.notEqual((await call('GET', '/users/3')).body.name, 'Ok', 'a rejected PUT changes nothing');
  assert.equal((await call('POST', '/users', { name: 'X', email: 'x@example.com', age: 'old' })).status, 400);
  assert.equal((await call('POST', '/products', { name: 'X', price: 'free' })).status, 400);

  const updated = await call('PUT', '/products/1', { price: '19.90', stock: 3 });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.price, 19.9);
});

// ─── The real server (src/server.ts) ──────────────────────────────────────────

const { spawn } = require('node:child_process');
const path = require('node:path');
const net = require('node:net');
const swaggerVersion = require(path.join(__dirname, '..', 'node_modules', '@romatech', 'swagger', 'package.json')).version;
// @romatech/swagger 2.0.0 throws "Could not detect framework" for express():
// the fix ships in 3.0.0. Until then this test is reported as TODO, not as passing.
const swaggerCanStart = Number(swaggerVersion.split('.')[0]) >= 3;

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer().listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    }).on('error', reject);
  });
}

test('the real server starts and serves the API, the OpenAPI spec and Swagger UI',
  { todo: swaggerCanStart ? false : `@romatech/swagger ${swaggerVersion} cannot detect Express; requires the 3.0.0 release` },
  async () => {
    const port = await freePort();
    const child = spawn(process.execPath, ['dist/server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const exited = new Promise(resolve => child.on('exit', code => resolve(code)));
    try {
      const base = `http://127.0.0.1:${port}`;
      let users;
      for (let attempt = 0; attempt < 100 && !users; attempt++) {
        const code = await Promise.race([exited, new Promise(resolve => setTimeout(resolve, 100))]);
        if (code !== undefined) assert.fail(`server exited with ${code}:\n${output}`);
        users = await fetch(`${base}/users`).then(r => (r.ok ? r.json() : undefined)).catch(() => undefined);
        if (users && users.length === 0) users = undefined; // seed still running
      }
      assert.ok(users, `server did not answer:\n${output}`);
      assert.equal(users.length, 5);
      const spec = await (await fetch(`${base}/api-docs.json`)).json();
      // @romatech/swagger documents app.get()/router calls found in ./src; the
      // decorator-based controllers of @romatech/ai-extensions are not
      // detected (a known limitation, see README), so only /health is checked.
      assert.ok(spec.paths['/health'], 'the spec is generated from ./src');
      assert.equal((await fetch(`${base}/api-docs`)).status, 200);
    } finally {
      child.kill();
      await exited;
    }
  });
