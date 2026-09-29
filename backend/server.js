const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ---- Data (memory mein) ----
const catalog = [
  { id: 1, name: 'Pizza', price: 800 },
  { id: 2, name: 'Burger', price: 500 },
];
let orders = [];

// ---- 1. REST API ----
app.get('/api/v1/catalog', (req, res) => res.json(catalog));
app.get('/api/v1/orders', (req, res) => res.json(orders));

app.post('/api/v1/orders', (req, res) => {
  const order = { id: orders.length + 1, item: req.body.item, status: 'Placed' };
  orders.push(order);
  io.emit('order:new', order);
  res.status(201).json(order);
});

app.patch('/api/v1/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id == req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = req.body.status;
  io.emit('order:status', order);   // real-time update
  res.json(order);
});

// ---- 3. JSON-RPC 2.0 ----
app.post('/rpc', (req, res) => {
  const { jsonrpc, method, params, id } = req.body;
  if (method === 'cancelOrder') {
    const order = orders.find(o => o.id == params.id);
    if (!order) return res.json({ jsonrpc: '2.0', error: { code: -32602, message: 'Order not found' }, id });
    order.status = 'Cancelled';
    io.emit('order:status', order);
    return res.json({ jsonrpc: '2.0', result: order, id });
  }
  res.json({ jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id });
});

// ---- 4. SSE ----
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();
  const timer = setInterval(() => {
    res.write(`data: ${JSON.stringify({ alert: 'System alert', time: new Date().toISOString() })}\n\n`);
  }, 5000);
  req.on('close', () => clearInterval(timer));
});

// ---- 2. WebSockets (Socket.io) ----
io.on('connection', (socket) => {
  socket.on('chat:join', ({ room }) => socket.join(room));
  socket.on('chat:message', ({ room, sender, text }) => {
    io.to(room).emit('chat:message', { sender, text, time: Date.now() });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on ' + PORT));