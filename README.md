# Real-Time Order Tracker & Live Support System

CSC337 - Lab Assignment 04

A full-stack web application that demonstrates four communication protocols in one project: REST, WebSockets (Socket.io), JSON-RPC 2.0 and Server-Sent Events (SSE).

## Live Links

- Frontend (Netlify): https://order-tracker-aqsa.netlify.app
- Backend (Railway): https://order-tracker-production-d639.up.railway.app

## Features

- **REST API** for the catalog and orders (`/api/v1/catalog`, `/api/v1/orders`)
- **WebSockets (Socket.io)** for real-time order status updates and a 1-on-1 chat room between Customer and Support agent
- **JSON-RPC 2.0** endpoint (`/rpc`) with a `cancelOrder` method
- **Server-Sent Events** (`/events`) that push live system alerts every 5 seconds

## Tech Stack

- Backend: Node.js, Express, Socket.io, CORS
- Frontend: HTML, CSS, JavaScript (single `index.html`)
- Deployment: Railway (backend), Netlify (frontend)

## Project Structure

```
lab04/
├── backend/
│   ├── server.js
│   └── package.json
├── frontend/
│   └── index.html
└── README.md
```

## REST API

Base path: `/api/v1`

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| GET | `/api/v1/catalog` | Get all catalog items | - |
| GET | `/api/v1/orders` | Get all orders | - |
| POST | `/api/v1/orders` | Create a new order | `{ "item": "Pizza" }` |
| PATCH | `/api/v1/orders/:id/status` | Update the status of an order | `{ "status": "Preparing" }` |

Example response of `POST /api/v1/orders`:

```json
{ "id": 1, "item": "Pizza", "status": "Placed" }
```

## JSON-RPC 2.0

Endpoint: `POST /rpc`

Supported method: `cancelOrder`

Request:

```json
{
  "jsonrpc": "2.0",
  "method": "cancelOrder",
  "params": { "id": 1 },
  "id": 1
}
```

Success response:

```json
{
  "jsonrpc": "2.0",
  "result": { "id": 1, "item": "Pizza", "status": "Cancelled" },
  "id": 1
}
```

Errors:

- `-32602` Order not found
- `-32601` Method not found

## Server-Sent Events (SSE)

Endpoint: `GET /events`

The server keeps the connection open and sends a system alert every 5 seconds:

```
data: {"alert":"System alert","time":"2026-09-30T00:00:00.000Z"}
```

Client example:

```js
const source = new EventSource('https://order-tracker-production-d639.up.railway.app/events');
source.onmessage = (e) => console.log(JSON.parse(e.data));
```

## WebSocket Events (Socket.io)

The server uses Socket.io with CORS enabled for all origins.

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `chat:join` | `{ room }` | Joins the given chat room (Customer and Support agent join the same room for a 1-on-1 chat) |
| `chat:message` | `{ room, sender, text }` | Sends a chat message to everyone in the room |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `order:new` | `order` object | Broadcast to all clients when a new order is placed |
| `order:status` | `order` object | Broadcast to all clients when an order status changes (via PATCH or `cancelOrder` RPC) |
| `chat:message` | `{ sender, text, time }` | Delivered to all clients in the room when a message is sent |

### Flow

1. Customer places an order (`POST /api/v1/orders`) and the server emits `order:new`.
2. Support updates the status (`PATCH /api/v1/orders/:id/status`) or the customer cancels it (`/rpc`), and the server emits `order:status`. All open pages update instantly without refresh.
3. Customer and Support both emit `chat:join` with the same room name, then exchange messages using `chat:message`.

## Setup Instructions (Run Locally)

### Prerequisites

- Node.js 18 or higher
- npm

### Backend

```bash
cd backend
npm install
node server.js
```

The server runs on `http://localhost:3000` (or the port in the `PORT` environment variable).

### Frontend

Open `frontend/index.html` in the browser (or use the VS Code Live Server extension). If you run the backend locally, change the backend URL inside `index.html` to `http://localhost:3000`.

## Deployment

- **Backend:** deployed on Railway from the `backend` folder. Start command: `node server.js`.
- **Frontend:** deployed on Netlify from the `frontend` folder.


