# 2026champs System Architecture & Workflow

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Models & Relationships](#data-models--relationships)
4. [Component Breakdown](#component-breakdown)
5. [Complete Workflows](#complete-workflows)
6. [Data Flow Diagrams](#data-flow-diagrams)

---

## 🎯 System Overview

**2026champs** is a real-time multiplayer quiz/game platform designed for user experience testing. The system enables:
- **Room-based gameplay**: Players join rooms with unique codes
- **Session management**: Multiple game sessions per room
- **Question answering**: Various question types (tap, drag, pick, predict, type_words, rate)
- **AI-powered analysis**: Sentiment analysis and scoring
- **Real-time & Async modes**: Flexible gameplay styles

### Tech Stack
- **Backend**: Go (Golang)
- **Database**: MongoDB (persistent storage)
- **Cache**: Redis (session caching)
- **API**: REST (HTTP) + WebSocket (planned)
- **Frontend**: Next.js/React (TypeScript)

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Transport Layer                       │
│  ┌──────────────┐              ┌──────────────┐         │
│  │ REST Router  │              │  WS Router   │         │
│  │  (Gorilla)   │              │  (Planned)   │         │
│  └──────────────┘              └──────────────┘         │
│           │                           │                  │
│           └───────────┬───────────────┘                  │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                    Application Layer                     │
│  ┌──────────────────────────────────────────────┐        │
│  │              app.App (Dependency Injection)  │        │
│  │  - PlayerRepo   - RoomRepo                   │        │
│  │  - SessionRepo  - SessionCache               │        │
│  └──────────────────────────────────────────────┘        │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                   Repository Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐│
│  │  Player  │  │   Room   │  │ Session  │  │ Answer  ││
│  │   Repo   │  │   Repo   │  │   Repo   │  │   Repo  ││
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘│
│  ┌──────────┐                                          │
│  │Question  │                                          │
│  │   Repo   │                                          │
│  └──────────┘                                          │
└───────────────────────┼──────────────────────────────────┘
                        │
┌───────────────────────┼──────────────────────────────────┐
│                    Storage Layer                         │
│  ┌──────────────────┐        ┌──────────────────┐       │
│  │   MongoDB        │        │      Redis       │       │
│  │  (Persistent)    │        │   (Cache/Temp)   │       │
│  │                  │        │                  │       │
│  │ Collections:     │        │  Keys:           │       │
│  │ - rooms          │        │  - session:{id}  │       │
│  │ - players        │        │                  │       │
│  │ - sessions       │        │  TTL: 10 min     │       │
│  │ - questions      │        │                  │       │
│  │ - answers        │        │                  │       │
│  └──────────────────┘        └──────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Models & Relationships

### Entity Relationship Diagram

```
┌─────────────┐
│    Room     │
│─────────────│
│ Code (PK)   │◄──────┐
│ Status      │       │
│ HostPlayerID│       │
│ ActiveSessID│       │
│ Settings    │       │
│ CreatedAt   │       │
└─────────────┘       │
                      │
         ┌────────────┼────────────┐
         │            │            │
         │            │            │
    ┌────▼────┐  ┌────▼────┐  ┌────▼────┐
    │ Player  │  │ Session │  │ Question│
    │─────────│  │─────────│  │─────────│
    │ ID (PK) │  │ ID (PK) │  │ ID (PK) │
    │ RoomCode│  │ RoomCode│  │ QSetID  │
    │ Nickname│  │ Status  │  │ Type    │
    │ Score   │  │ Started │  │ Text    │
    │ Rating  │  │ Ended   │  │ Options │
    └─────────┘  └────┬────┘  └─────────┘
                      │
                 ┌────▼────┐
                 │ Answer  │
                 │─────────│
                 │ ID (PK) │
                 │ Session │
                 │ Player  │
                 │ Question│
                 │ Response│
                 │ Points  │
                 │ Sentiment│
                 └─────────┘
```

### Model Details

#### 1. **Room** (`model/room.go`)
- **Purpose**: Container for game sessions
- **Key Fields**:
  - `Code`: Unique room identifier (e.g., "ABC123")
  - `Status`: `waiting` | `live` | `ended`
  - `HostPlayerID`: Creator of the room
  - `ActiveSessionID`: Current active game session
  - `Settings`: Game configuration (mode, maxPlayers, timePerQuestion, questionSetId)
- **Storage**: MongoDB collection `rooms`

#### 2. **Player** (`model/player.go`)
- **Purpose**: Represents a user in a room
- **Key Fields**:
  - `ID`: Unique player identifier
  - `RoomCode`: Links to room
  - `Nickname`: Display name
  - `Score`: Total points earned
  - `Rating`: Player rating/ranking
- **Storage**: MongoDB collection `players`

#### 3. **Session** (`model/session.go`)
- **Purpose**: Represents a game round/session
- **Key Fields**:
  - `ID`: Unique session identifier
  - `RoomCode`: Links to room
  - `Status`: `waiting` | `active` | `ended`
  - `StartedAt`: Session start time
  - `EndedAt`: Session end time (nullable)
- **Storage**: 
  - MongoDB collection `sessions` (persistent)
  - Redis cache `session:{id}` (10min TTL, fast access)

#### 4. **Question** (`model/question.go`)
- **Purpose**: Game questions with various types
- **Key Fields**:
  - `ID`: Unique question identifier
  - `QuestionSetID`: Groups questions together
  - `Type`: `tap` | `drag` | `pick` | `predict` | `type_words` | `rate`
  - `Text`: Question content
  - `Options`: Available choices (for pick/tap)
  - `TimeLimitSec`: Time constraint
  - `Category`: `usability` | `performance` | `design`
  - `Priority`: 1-10 importance level
  - `AIPrompts`: Hints for AI analysis
- **Storage**: MongoDB collection `questions`

#### 5. **Answer** (`model/answer.go`)
- **Purpose**: Player responses to questions
- **Key Fields**:
  - `ID`: Unique answer identifier
  - `SessionID`: Links to session
  - `PlayerID`: Links to player
  - `QuestionID`: Links to question
  - `RoundNumber`: Question sequence
  - `Response`: Variant data (text, selectedOption, rating, dragPosition, words)
  - `Points`: Breakdown (speed, clarity, insight, streak, total)
  - `Sentiment`: AI analysis (sentiment, confidence, keyThemes, emotion, intensity)
  - `TimeTakenSec`: Response time
  - `IsSkipped`: Whether question was skipped
- **Storage**: MongoDB collection `answers`

---

## 🔧 Component Breakdown

### 1. Application Layer (`internal/app/app.go`)

**Purpose**: Dependency injection container

```go
type App struct {
    PlayerRepo   repository.PlayerRepo
    RoomRepo     repository.RoomRepo
    SessionRepo  repository.SessionRepo
    SessionCache cache.SessionCache
}
```

**Responsibilities**:
- Centralizes all dependencies
- Passed to handlers for access to repositories
- Enables easy testing (mockable interfaces)

---

### 2. Repository Layer (`internal/repository/`)

**Pattern**: Repository Pattern (Data Access Layer)

#### **PlayerRepo** (`player_repo.go`)
- `Create(ctx, player)`: Create new player
- `GetByID(ctx, id)`: Fetch player by ID
- `Update(ctx, player)`: Update player data
- `Delete(ctx, id)`: Remove player

#### **RoomRepo** (`room_repo.go`)
- `Create(ctx, room)`: Create new room
- `GetByCode(ctx, code)`: Fetch room by code (primary lookup)
- `Update(ctx, room)`: Update room state
- `Delete(ctx, code)`: Remove room

#### **SessionRepo** (`session_repo.go`)
- `Create(ctx, session)`: Create new session
- `GetByID(ctx, id)`: Fetch session by ID
- `Update(ctx, session)`: Update session state
- `Delete(ctx, id)`: Remove session
- `GetByRoomCode(ctx, roomCode)`: Get all sessions for a room

#### **QuestionRepo** (`question_repo.go`)
- **Basic CRUD**: Create, GetByID, Update, Delete
- **Query Methods**:
  - `GetByCategory(ctx, category)`: Filter by category
  - `GetByPriority(ctx, min, max)`: Filter by priority range
  - `GetByType(ctx, type)`: Filter by question type
  - `GetByIDs(ctx, ids)`: Batch fetch by IDs
  - `GetAll(ctx)`: Fetch all questions
  - `GetActive(ctx)`: Fetch active questions

#### **AnswerRepo** (`answer_repo.go`)
- `Create(ctx, answer)`: Save answer
- `GetByID(ctx, id)`: Fetch answer by ID
- `GetBySessionID(ctx, sessionID)`: Get all answers for a session
- `GetByPlayerID(ctx, playerID)`: Get all answers by a player
- `Update(ctx, answer)`: Update answer (e.g., add AI analysis)
- `Delete(ctx, id)`: Remove answer

---

### 3. Cache Layer (`internal/cache/session_cache.go`)

**Purpose**: Fast access to active sessions

**Implementation**:
- **Storage**: Redis
- **Key Format**: `session:{sessionID}`
- **TTL**: 10 minutes
- **Operations**:
  - `Set(ctx, session)`: Cache session (JSON serialized)
  - `Get(ctx, id)`: Retrieve cached session
  - `Delete(ctx, id)`: Remove from cache

**Why Cache?**
- Active sessions accessed frequently during gameplay
- Reduces MongoDB load
- Faster response times for real-time operations

---

### 4. Transport Layer (`internal/transport/`)

#### **REST Router** (`rest/router.go`)
- **Framework**: Gorilla Mux
- **Current Routes**:
  - `GET /players` → `handlers.GetPlayers()`
- **Status**: Minimal implementation (handlers mostly stubbed)

#### **REST Handlers** (`rest/handlers/`)
- `handlers.go`: Placeholder (empty)
- `players.go`: Stub implementation for `GetPlayers()`

#### **WebSocket Router** (`ws/router.go`)
- **Status**: Empty (planned for real-time communication)

---

### 5. Storage Layer (`store/`)

#### **MongoDB Client** (`store/mongo/client.go`)
- **Connection**: 10-second timeout
- **Database**: `2026champs`
- **Collections**:
  - `rooms`
  - `players`
  - `sessions`
  - `questions`
  - `answers`

#### **Redis Client** (`store/redis/client.go`)
- **Purpose**: Session caching
- **Default**: `localhost:6379`

---

### 6. Configuration (`config/config.go`)

**Environment Variables**:
- `MONGO_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `REDIS_ADDR`: Redis address (default: `localhost:6379`)
- `HTTP_PORT`: REST API port (default: `8080`)
- `WS_PORT`: WebSocket port (default: `8081`)

---

## 🔄 Complete Workflows

### Workflow 1: Room Creation & Player Joining

```
┌─────────┐
│  Host   │
└────┬────┘
     │
     │ 1. POST /api/rooms
     │    { hostPlayerId, settings }
     │
     ▼
┌─────────────────┐
│ REST Handler    │
└────┬────────────┘
     │
     │ 2. app.RoomRepo.Create()
     │
     ▼
┌─────────────────┐
│  RoomRepo       │
│  - Generate Code│
│  - Set Status   │
│  - Save to Mongo│
└────┬────────────┘
     │
     │ 3. Return Room{Code, Status: "waiting"}
     │
     ▼
┌─────────┐
│  Host   │
│  Gets   │
│  Code   │
└────┬────┘
     │
     │ 4. Share Code: "ABC123"
     │
     ▼
┌─────────┐
│ Players │
└────┬────┘
     │
     │ 5. POST /api/rooms/join
     │    { roomCode: "ABC123", playerName }
     │
     ▼
┌─────────────────┐
│ REST Handler    │
└────┬────────────┘
     │
     │ 6. app.RoomRepo.GetByCode("ABC123")
     │    app.PlayerRepo.Create(player)
     │
     ▼
┌─────────────────┐
│  Repositories   │
│  - Verify Room  │
│  - Create Player│
│  - Link to Room │
└────┬────────────┘
     │
     │ 7. Return Player{ID, RoomCode, Nickname}
     │
     ▼
┌─────────┐
│ Players │
│  Joined │
└─────────┘
```

**Steps**:
1. Host creates room via REST API
2. System generates unique room code
3. Room saved to MongoDB with `Status = "waiting"`
4. Host receives room code
5. Players join using room code
6. System validates room exists and creates player records
7. Players linked to room via `RoomCode`

---

### Workflow 2: Starting a Game Session

```
┌─────────┐
│  Host   │
└────┬────┘
     │
     │ 1. POST /api/rooms/{code}/start
     │
     ▼
┌─────────────────┐
│ REST Handler    │
└────┬────────────┘
     │
     │ 2. app.RoomRepo.GetByCode(code)
     │    app.QuestionRepo.GetByQuestionSetID(room.Settings.QuestionSetID)
     │
     ▼
┌─────────────────┐
│  Repositories   │
│  - Fetch Room   │
│  - Fetch Qs     │
└────┬────────────┘
     │
     │ 3. Create Session
     │    session := Session{
     │      RoomCode: code,
     │      Status: "waiting"
     │    }
     │
     ▼
┌─────────────────┐
│ SessionRepo     │
│  - Create()     │
└────┬────────────┘
     │
     │ 4. Cache in Redis
     │    app.SessionCache.Set(session)
     │
     ▼
┌─────────────────┐
│ SessionCache    │
│  - Store in Redis│
│  - TTL: 10 min  │
└────┬────────────┘
     │
     │ 5. Update Room
     │    room.ActiveSessionID = session.ID
     │    room.Status = "live"
     │    app.RoomRepo.Update(room)
     │
     ▼
┌─────────────────┐
│  RoomRepo       │
│  - Update Room  │
└────┬────────────┘
     │
     │ 6. Return Session{ID, Status: "active"}
     │
     ▼
┌─────────┐
│  Host   │
│  Game   │
│ Started │
└─────────┘
```

**Steps**:
1. Host triggers session start
2. System fetches room and questions
3. Creates new session record
4. Caches session in Redis for fast access
5. Updates room with active session ID
6. Changes room status to `"live"`

---

### Workflow 3: Answering Questions

```
┌─────────┐
│ Player  │
└────┬────┘
     │
     │ 1. POST /api/sessions/{id}/answers
     │    { questionId, response, timeTaken }
     │
     ▼
┌─────────────────┐
│ REST Handler    │
└────┬────────────┘
     │
     │ 2. app.SessionCache.Get(sessionID)
     │    (Fast lookup from Redis)
     │
     ▼
┌─────────────────┐
│ SessionCache    │
│  - Check Redis  │
└────┬────────────┘
     │
     │ 3. If not in cache:
     │    app.SessionRepo.GetByID(sessionID)
     │
     ▼
┌─────────────────┐
│ SessionRepo     │
│  - Fetch from   │
│    MongoDB      │
└────┬────────────┘
     │
     │ 4. Create Answer
     │    answer := Answer{
     │      SessionID: sessionID,
     │      PlayerID: playerID,
     │      QuestionID: questionID,
     │      Response: responseData,
     │      TimeTakenSec: timeTaken
     │    }
     │
     ▼
┌─────────────────┐
│ AnswerRepo      │
│  - Create()     │
└────┬────────────┘
     │
     │ 5. Calculate Points
     │    - Speed points (based on time)
     │    - Clarity points (response quality)
     │    - Insight points (uniqueness)
     │    - Streak bonus
     │
     ▼
┌─────────────────┐
│ AI Analysis     │
│  (Future)       │
│  - Sentiment    │
│  - Key Themes   │
│  - Emotion      │
└────┬────────────┘
     │
     │ 6. Update Answer with Points & Sentiment
     │    app.AnswerRepo.Update(answer)
     │
     ▼
┌─────────────────┐
│ AnswerRepo      │
│  - Save to Mongo│
└────┬────────────┘
     │
     │ 7. Update Player Score
     │    player.Score += answer.Points.TotalPoints
     │    app.PlayerRepo.Update(player)
     │
     ▼
┌─────────────────┐
│ PlayerRepo      │
│  - Update Score │
└────┬────────────┘
     │
     │ 8. Return Answer{ID, Points, Sentiment}
     │
     ▼
┌─────────┐
│ Player  │
│ Updated │
└─────────┘
```

**Steps**:
1. Player submits answer via REST API
2. System checks Redis cache for session (fast path)
3. If cache miss, fetch from MongoDB
4. Create answer record
5. Calculate points (speed, clarity, insight, streak)
6. Run AI analysis (sentiment, themes, emotion) - *Future*
7. Save answer with analysis
8. Update player's total score

---

### Workflow 4: Ending a Session

```
┌─────────┐
│  Host   │
└────┬────┘
     │
     │ 1. POST /api/sessions/{id}/end
     │
     ▼
┌─────────────────┐
│ REST Handler    │
└────┬────────────┘
     │
     │ 2. app.SessionRepo.GetByID(sessionID)
     │    app.AnswerRepo.GetBySessionID(sessionID)
     │
     ▼
┌─────────────────┐
│  Repositories   │
│  - Fetch Session│
│  - Fetch Answers│
└────┬────────────┘
     │
     │ 3. Calculate Final Scores
     │    - Aggregate player scores
     │    - Generate leaderboard
     │
     ▼
┌─────────────────┐
│ Session Update  │
│  session.Status = "ended"
│  session.EndedAt = now()
│
└────┬────────────┘
     │
     │ 4. app.SessionRepo.Update(session)
     │    app.SessionCache.Delete(sessionID)
     │
     ▼
┌─────────────────┐
│  Repositories   │
│  - Update Mongo │
│  - Remove Cache │
└────┬────────────┘
     │
     │ 5. Update Room
     │    room.ActiveSessionID = ""
     │    room.Status = "waiting" or "ended"
     │    app.RoomRepo.Update(room)
     │
     ▼
┌─────────────────┐
│  RoomRepo       │
│  - Update Room  │
└────┬────────────┘
     │
     │ 6. Return Session{Status: "ended", Leaderboard}
     │
     ▼
┌─────────┐
│  Host   │
│ Session │
│  Ended  │
└─────────┘
```

**Steps**:
1. Host ends session
2. System fetches session and all answers
3. Calculates final scores and leaderboard
4. Updates session status to `"ended"` with end timestamp
5. Removes session from Redis cache
6. Updates room (clears active session, may change status)

---

## 📈 Data Flow Diagrams

### Request Flow (REST API)

```
Client Request
    │
    ▼
┌─────────────────┐
│  REST Router    │  (Gorilla Mux)
│  - Route Match   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Handler        │  (handlers/*.go)
│  - Extract Params│
│  - Validate Input│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  app.App        │  (Dependency Injection)
│  - Access Repos │
└────────┬────────┘
         │
         ├──────────┐
         │          │
         ▼          ▼
┌─────────────┐  ┌─────────────┐
│ Repository  │  │   Cache     │
│  (MongoDB)  │  │   (Redis)   │
└─────────────┘  └─────────────┘
         │          │
         └────┬─────┘
              │
              ▼
         Response
```

### Session Caching Strategy

```
Read Session:
    │
    ├─► Check Redis Cache ──► Hit? ──► Return (Fast Path)
    │                              │
    │                              └─► Miss
    │                                      │
    └──────────────────────────────────────┘
                                          │
                                          ▼
                                    MongoDB Query
                                          │
                                          ▼
                                    Return & Cache
                                          │
                                          ▼
                                    Redis Set (10min TTL)
```

---

## 🔑 Key Design Patterns

1. **Repository Pattern**: Abstracts data access, enables testing
2. **Dependency Injection**: `app.App` centralizes dependencies
3. **Caching Strategy**: Redis for hot data (active sessions)
4. **Layered Architecture**: Clear separation (Transport → App → Repository → Storage)
5. **Interface-Based Design**: Repositories use interfaces for flexibility

---

## 🚀 Current Implementation Status

### ✅ Implemented
- Data models (Room, Player, Session, Question, Answer)
- Repository layer (all CRUD operations)
- MongoDB integration
- Redis caching for sessions
- Basic REST router structure
- Configuration management

### 🚧 In Progress / Stubbed
- REST handlers (mostly placeholders)
- WebSocket router (empty)
- AI analysis integration
- Question selection logic
- Real-time updates

### 📝 Future Enhancements
- Complete REST API endpoints
- WebSocket for real-time communication
- AI sentiment analysis pipeline
- Leaderboard generation
- Room code generation algorithm
- Player authentication
- Rate limiting
- Error handling middleware

---

## 📝 Notes

- **Database**: All collections in MongoDB database `2026champs`
- **Cache TTL**: Sessions cached for 10 minutes
- **ID Generation**: MongoDB ObjectIDs converted to hex strings
- **Status Management**: Room and Session use string-based status enums
- **Points System**: Answers include detailed points breakdown (speed, clarity, insight, streak)

---

*Generated from analysis of `api/internal/` directory*
