# Real-Time Order Tracker & Live Support System

Web Development Lab #4

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

## Testing Screenshots

### API Root
<img width="1919" height="959" alt="API running message" src="https://github.com/user-attachments/assets/14ab3b98-82a3-44c6-be8f-05c34f9bc63a" />

### REST: Catalog
<img width="1919" height="956" alt="catalog JSON" src="https://github.com/user-attachments/assets/ff2e18b9-c3cc-4773-a927-13dfd2e4aa8e" />

### REST: Orders
<img width="1920" height="964" alt="order" src="https://github.com/user-attachments/assets/531a1a1a-c9d7-4804-ab87-5250fa7522f6" />

### SSE: Live Alerts
<img width="1919" height="1012" alt="event alert" src="https://github.com/user-attachments/assets/087394d1-9af2-4d4c-a53d-f139e30bdcfc" />

### Frontend
<img width="1920" height="967" alt="front" src="https://github.com/user-attachments/assets/3138a47a-d92a-43c3-b1ca-d6196e4ff7d0" />

### Real-Time Order Update (WebSocket)
<img width="1920" height="964" alt="order" src="https://github.com/user-attachments/assets/3ab5f9b4-0e71-48f7-b65e-c71ab1eb7ebe" />

### Live Chat (Customer and Support)
<img width="1919" height="960" alt="customer" src="https://github.com/user-attachments/assets/fac2425c-b810-4540-ae25-4194d9691764" />
<img width="1920" height="978" alt="support" src="https://github.com/user-attachments/assets/5bafb2c5-c636-4c58-b2ec-f2da486fc69b" />

### Create Order (REST POST)
<img width="1919" height="960" alt="customer" src="https://github.com/user-attachments/assets/7806a14f-d74f-476d-8e8a-a6bb67c4cdcb" />

### JSON-RPC cancelOrder
<img width="1919" height="960" alt="customer" src="https://github.com/user-attachments/assets/7806a14f-d74f-476d-8e8a-a6bb67c4cdcb" />










