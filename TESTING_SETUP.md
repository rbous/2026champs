# Testing Setup Guide

## Prerequisites

1. **MongoDB** - Running on `localhost:27017` (default)
2. **Redis** - Running on `localhost:6379` (default)
3. **Go** - For backend
4. **Node.js** - For frontend

## Backend Setup

1. Navigate to the API directory:
```bash
cd api
```

2. Install dependencies:
```bash
go mod download
```

3. Start the backend server:
```bash
go run cmd/server/main.go
```

The server will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to the web directory:
```bash
cd web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:3000` (or next available port)

## Testing the Flow

### 1. Create a Room
- Open `http://localhost:3000`
- Click "Create Room"
- Enter your name
- Click "Create & Join"
- You should receive a room code (e.g., "ABC123")

### 2. Join a Room (in another browser/tab)
- Open `http://localhost:3000`
- Click "Join Room"
- Enter the room code from step 1
- Enter your name
- Click "Join Game"

### 3. Test Game Flow
- The game will use mock questions for now
- Answer questions and submit
- Points will be calculated and saved to the database

## API Endpoints Available

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms/{code}` - Get room details
- `POST /api/rooms/join` - Join a room

### Sessions
- `POST /api/sessions` - Start a new session
- `GET /api/sessions/{id}` - Get session details
- `POST /api/sessions/{id}/end` - End a session

### Answers
- `POST /api/answers` - Submit an answer
- `GET /api/sessions/{sessionId}/answers` - Get all answers for a session

### Players
- `GET /api/players` - Get all players (stub)

## Database Collections

All data is stored in MongoDB database `2026champs`:
- `rooms` - Room data
- `players` - Player data
- `sessions` - Session data
- `answers` - Answer data
- `questions` - Question data (not yet populated)

## Current Limitations

1. **Questions**: Using mock questions in frontend (no question API yet)
2. **Session Management**: Frontend doesn't automatically start sessions yet
3. **Answer Submission**: Frontend uses mock scoring (backend ready but not fully integrated)
4. **AI Analysis**: Not yet implemented (Gemini integration pending)

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongosh` or check MongoDB service
- Check Redis is running: `redis-cli ping` should return `PONG`
- Check port 8080 is available

### Frontend can't connect to backend
- Verify backend is running on `http://localhost:8080`
- Check browser console for CORS errors (CORS is enabled for development)
- Verify API endpoints are accessible: `curl http://localhost:8080/api/players`

### Room creation fails
- Check MongoDB connection
- Verify room code generation is working
- Check backend logs for errors

### Can't join room
- Verify room code is correct
- Check room exists in database
- Verify player creation is working

## Next Steps

1. Add question management API
2. Integrate session starting in frontend
3. Connect answer submission to backend
4. Add Gemini AI integration for answer analysis
5. Add real-time updates via WebSocket
