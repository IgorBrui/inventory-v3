// Mock REST API: отдаёт начальные данные инвентаря по адресу /db.json
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';

const PORT = 3001;
const dbUrl = new URL('./db.json', import.meta.url);

createServer((req, res) => {
  console.log(new Date().toLocaleTimeString(), req.method, req.url);
  if (req.method === 'GET' && req.url === '/db.json') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(readFileSync(dbUrl));
  } else {
    res.writeHead(404).end();
  }
}).listen(PORT, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces())
    .flat()
    .filter((net) => net && net.family === 'IPv4' && !net.internal)
    .map((net) => `http://${net.address}:${PORT}/db.json`);
  console.log('Mock API запущен:', addresses.join(', ') || `http://localhost:${PORT}/db.json`);
});
