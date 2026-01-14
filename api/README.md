# API Server

Backend API server for the AI Hub application.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **ts-node-dev** - Development server with hot reload

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root of the `app/api` directory:

```env
PORT=3000
# Add other environment variables as needed
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Build

Build the TypeScript code:

```bash
npm run build
```

The compiled JavaScript will be output to the `dist/` directory.

### Production

Start the production server:

```bash
npm start
```

## Project Structure

```text
app/api/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts            # Server entry point
│   ├── controllers/         # Request handlers
│   │   └── health.controller.ts
│   └── routes/              # API routes
│       └── health.route.ts
├── data/                    # CSV data files
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Health Check

- `GET /health` - Health check endpoint

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
