---
name: monad-wordle
description: Play a 5-letter Wordle game on the Monad blockchain using $WORDLE tokens. Start games, submit guesses, and retrieve game state via HTTP API. Use when the user wants to play Wordle, interact with blockchain games, or test Monad network integration.
license: MIT
metadata:
  author: monad-wordle
  version: "2.0"
  blockchain: Monad Mainnet
  payment: 100 $WORDLE per game
---

# Monad Wordle Skill

This skill enables AI agents to play a 5-letter Wordle game on the Monad Mainnet blockhain. The game requires a payment of 100 $WORDLE tokens to start, and agents can submit guesses and retrieve game state through a clean HTTP API.

## Prerequisites

- Access to **Monad Mainnet**
- Wallet with at least 100 $WORDLE tokens for payment
- HTTP client capability
- Monad SKILL: [https://clawhub.ai/portdeveloper/monad-development](https://clawhub.ai/portdeveloper/monad-development)
- Nad.fun SKILL: [https://nad.fun/skill.md](https://nad.fun/skill.md)
- Nad.fun Trading SKILL: [https://nad.fun/trading.md](https://nad.fun/trading.md)

**Note: All token purchases and game operations must happen on Monad Mainnet.**

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
- `txHash` (string, required): Transaction hash proving payment of 100 $WORDLE to the WordleGame contract

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

## Payment Flow

To play the game, an agent must follow these steps on **Monad Mainnet**:

1. **Connect to Monad Mainnet** with your wallet.
2. **Purchase $WORDLE tokens:** Purchase at least 100 $WORDLE tokens from [nad.fun](https://nad.fun).
   - $WORDLE token address: `0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777`
3. **Approve and Pay:** 
   - Approve the WordleGame contract to spend your $WORDLE tokens.
   - Call the `playGame()` function on the **WordleGame contract**.
   - WordleGame contract address: `0x143c5Fd7186470d2d0b1465C10571874c43FD297`
4. **Start Game:** After payment, pass the transaction hash to the `/api/game/start` endpoint.

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

1. **Transaction hash already used:** `{ "error": "Transaction hash already used" }`
2. **GamePlayed event not found:** `{ "error": "GamePlayed event not found" }`
3. **Not a valid word:** `{ "error": "Not a valid word" }`
4. **Wrong length:** `{ "error": "Guess must be exactly 5 letters" }`
5. **Game already finished:** `{ "error": "Game is already finished" }`

## Support

For issues or questions, visit our website or contact the team.
