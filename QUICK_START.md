# 🚀 Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- ✅ **MongoDB** installed and running
- ✅ **Redis** installed and running  
- ✅ **Go** (1.24+) installed
- ✅ **Node.js** (18+) and npm installed

## Option 1: Manual Setup (Recommended for Development)

### Step 1: Start MongoDB & Redis

**Windows:**
```powershell
# Start MongoDB (if installed as service, it should auto-start)
# Or start manually:
mongod

# Start Redis (if installed)
redis-server
```

**Mac/Linux:**
```bash
# MongoDB
mongod

# Redis
redis-server
```

**Or use Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
docker run -d -p 6379:6379 --name redis redis:latest
```

### Step 2: Start Backend (Terminal 1)

```bash
# Navigate to API directory
cd api

# Install Go dependencies
go mod download

# Run the server
go run cmd/server/main.go
```

✅ Backend should be running on `http://localhost:8080`

### Step 3: Start Frontend (Terminal 2)

```bash
# Navigate to web directory
cd web

# Install Node dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

### Step 4: Test It!

1. Open browser: `http://localhost:3000`
2. Click "Create Room"
3. Enter your name
4. Click "Create & Join"
5. You should see a room code!

---

## Option 2: Using Docker Compose (Easier)

If you have Docker installed:

```bash
# From project root
docker-compose up -d

# This will start:
# - MongoDB on port 27017
# - Redis on port 6379
```

Then follow **Step 2** and **Step 3** above to start backend and frontend.

---

## Quick Test Commands

### Test Backend API:
```bash
# Test if backend is running
curl http://localhost:8080/api/players

# Should return: [{"id":"1","name":"Player1"}]
```

### Test MongoDB:
```bash
# Connect to MongoDB
mongosh

# Or use mongo command
mongo
```

### Test Redis:
```bash
redis-cli ping
# Should return: PONG
```

---

## Troubleshooting

### ❌ "Failed to connect to Mongo"
- Make sure MongoDB is running
- Check: `mongosh` should connect
- Default connection: `mongodb://localhost:27017`

### ❌ "Failed to connect to Redis"
- Make sure Redis is running
- Check: `redis-cli ping` should return `PONG`
- Default connection: `localhost:6379`

### ❌ "Port 8080 already in use"
- Another process is using port 8080
- Kill it or change port in `api/config/config.go`

### ❌ "Port 3000 already in use"
- Next.js will automatically use next available port (3001, 3002, etc.)
- Or kill the process using port 3000

### ❌ Frontend can't connect to backend
- Make sure backend is running on port 8080
- Check browser console for errors
- Verify CORS is enabled (it should be)

---

## Environment Variables (Optional)

You can set these environment variables to customize:

```bash
# Backend
export MONGO_URI="mongodb://localhost:27017"
export REDIS_ADDR="localhost:6379"
export HTTP_PORT="8080"

# Or create a .env file in api/ directory
```

---

## What's Running?

After setup, you should have:

1. **MongoDB** → `localhost:27017` (Database)
2. **Redis** → `localhost:6379` (Cache)
3. **Backend API** → `localhost:8080` (Go server)
4. **Frontend** → `localhost:3000` (Next.js app)

---

## Next Steps

1. ✅ Create a room
2. ✅ Join with another player
3. ✅ Test the game flow
4. 🔜 Add Gemini AI integration
5. 🔜 Add real-time features

---

## Need Help?

Check the full documentation in `TESTING_SETUP.md` for more details!
