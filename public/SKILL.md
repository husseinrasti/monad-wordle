---
name: monad-wordle
description: Play a 5-letter Wordle game on the Monad blockchain. Start games, submit guesses, and retrieve game state via HTTP API. Use when the user wants to play Wordle, interact with blockchain games, or test Monad network integration.
license: MIT
metadata:
  author: monad-wordle
  version: "1.0"
  blockchain: Monad
  payment: 1 MON per game
---

# Monad Wordle Skill

This skill enables AI agents to play a 5-letter Wordle game on the Monad blockchain. The game requires a payment of 1 MON to start (on Testnet), and agents can submit guesses and retrieve game state through a clean HTTP API.

## Prerequisites

- Access to Monad blockchain
- Wallet with at least 1 MON for payment
- HTTP client capability

## API Endpoints

All endpoints are hosted at the application's base URL.

### Base URL

```
https://wordle.nadnation.xyz
```

### 1. Start a New Game

**Endpoint:** `POST /api/game/start`

**Description:** Initiates a new Wordle game after payment verification.

**Request Body:**
```json
{
  "address": "0x...",
  "txHash": "0x..."
}
```

**Parameters:**
- `address` (string, required): The wallet address of the player
- `txHash` (string, required): Transaction hash proving payment of 1 MON

**Response:**
```json
{
  "gameId": "k17abc123...",
  "message": "Game started successfully"
}
```

**Example:**
```bash
curl -X POST https://wordle.nadnation.xyz/api/game/start \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }'
```

### 2. Submit a Guess

**Endpoint:** `POST /api/game/guess`

**Description:** Submit a 5-letter word guess for the current game.

**Request Body:**
```json
{
  "gameId": "k17abc123...",
  "guess": "crane"
}
```

**Parameters:**
- `gameId` (string, required): The game ID returned from start
- `guess` (string, required): A 5-letter word (must exist in the dictionary)

**Response:**
```json
{
  "result": ["correct", "present", "absent", "absent", "present"],
  "status": "playing",
  "guessesRemaining": 5
}
```

**Example:**
```bash
curl -X POST https://wordle.nadnation.xyz/api/game/guess \
  -H "Content-Type: application/json" \
  -d '{
    "gameId": "k17abc123...",
    "guess": "crane"
  }'
```

### 3. Get Game State

**Endpoint:** `GET /api/game/state?gameId={gameId}`

**Description:** Retrieve the current state of a game.

**Query Parameters:**
- `gameId` (string, required): The game ID

**Response:**
```json
{
  "gameId": "k17abc123...",
  "status": "playing",
  "guesses": ["crane", "slant"],
  "results": [
    ["correct", "present", "absent", "absent", "present"],
    ["correct", "absent", "present", "absent", "correct"]
  ],
  "guessesRemaining": 4,
  "word": "APPLE" // Only revealed if status is 'won' or 'lost'
}
```

**Example:**
```bash
curl "https://wordle.nadnation.xyz/api/game/state?gameId=k17abc123..."
```

### 4. Get Leaderboard

**Endpoint:** `GET /api/game/leaderboard`

**Description:** Retrieve the top players on the leaderboard.

**Response:**
```json
[
  {
    "rank": 1,
    "address": "0x1234...5678",
    "gamesPlayed": 50,
    "gamesWon": 45,
    "winRate": 90,
    "currentStreak": 10,
    "maxStreak": 15
  }
]
```

**Example:**
```bash
curl "https://wordle.nadnation.xyz/api/game/leaderboard"
```

## Gameplay Strategy

### Recommended Approach

1. **Start with a strong opening word** containing common vowels and consonants:
   - "CRANE", "SLATE", "TRACE", "ADIEU", "AUDIO"

2. **Analyze the feedback:**
   - Green (correct): Letter is in the right position
   - Yellow (present): Letter exists but in wrong position
   - Gray (absent): Letter is not in the word

## Error Handling

### Common Errors

1. **Invalid word:** `{ "error": "Not a valid word" }`
2. **Wrong length:** `{ "error": "Guess must be exactly 5 letters" }`
3. **Game already finished:** `{ "error": "Game is already finished" }`

## Payment Flow

1. **Send 1 MON** to your own address (or game contract address in production)
2. **Wait for transaction confirmation** on Monad network
3. **Call startGame** with your wallet address and transaction hash

## Support

For issues or questions, visit our website or contact the team.
