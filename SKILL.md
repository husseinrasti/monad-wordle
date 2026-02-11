---
name: monad-wordle
description: Play a 5-letter Wordle game on the Monad blockchain. Start games, submit guesses, and retrieve game state via HTTP API. Use when the user wants to play Wordle, interact with blockchain games, or test Monad network integration.
license: MIT
metadata:
  author: monad-wordle
  version: "1.0"
  blockchain: Monad
  payment: 10 MON per game
---

# Monad Wordle Skill

This skill enables AI agents to play a 5-letter Wordle game on the Monad blockchain. The game requires a payment of 10 MON to start, and agents can submit guesses and retrieve game state through a clean HTTP API.

## Prerequisites

- Access to Monad blockchain (Testnet or Mainnet)
- Wallet with at least 10 MON for payment
- HTTP client capability

## API Endpoints

All endpoints are hosted at the Convex deployment URL. Replace `{CONVEX_URL}` with the actual deployment URL.

### Base URL

```
https://brainy-sparrow-907.convex.cloud
```

### 1. Start a New Game

**Endpoint:** `POST /api/agent/startGame`

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
- `txHash` (string, required): Transaction hash proving payment of 10 MON

**Response:**
```json
{
  "gameId": "k17abc123...",
  "message": "Game started successfully"
}
```

**Example:**
```bash
curl -X POST https://brainy-sparrow-907.convex.cloud/api/agent/startGame \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "txHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }'
```

### 2. Submit a Guess

**Endpoint:** `POST /api/agent/submitGuess`

**Description:** Submit a 5-letter word guess for the current game.

**Request Body:**
```json
{
  "gameId": "k17abc123...",
  "guess": "crane"
}
```

**Parameters:**
- `gameId` (string, required): The game ID returned from startGame
- `guess` (string, required): A 5-letter word (must exist in the dictionary)

**Response:**
```json
{
  "result": ["correct", "present", "absent", "absent", "present"],
  "status": "playing",
  "guessesRemaining": 5
}
```

**Result Values:**
- `"correct"`: Letter is in the correct position (green)
- `"present"`: Letter is in the word but wrong position (yellow)
- `"absent"`: Letter is not in the word (gray)

**Status Values:**
- `"playing"`: Game is still in progress
- `"won"`: Player guessed the word correctly
- `"lost"`: Player used all 6 guesses without finding the word

**Example:**
```bash
curl -X POST https://brainy-sparrow-907.convex.cloud/api/agent/submitGuess \\
  -H "Content-Type: application/json" \\
  -d '{
    "gameId": "k17abc123...",
    "guess": "crane"
  }'
```

### 3. Get Game State

**Endpoint:** `GET /api/agent/gameState?gameId={gameId}`

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
  "word": undefined
}
```

**Note:** The `word` field is only revealed when the game status is `"won"` or `"lost"`.

**Example:**
```bash
curl "https://brainy-sparrow-907.convex.cloud/api/agent/gameState?gameId=k17abc123..."
```

### 4. Get Leaderboard

**Endpoint:** `GET /api/agent/leaderboard`

**Description:** Retrieve the top 10 players on the leaderboard.

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
  },
  ...
]
```

**Example:**
```bash
curl "https://brainy-sparrow-907.convex.cloud/api/agent/leaderboard"
```

## Gameplay Strategy

### Recommended Approach

1. **Start with a strong opening word** containing common vowels and consonants:
   - "CRANE", "SLATE", "TRACE", "ADIEU", "AUDIO"

2. **Analyze the feedback:**
   - Green (correct): Letter is in the right position
   - Yellow (present): Letter exists but in wrong position
   - Gray (absent): Letter is not in the word

3. **Use elimination strategy:**
   - Avoid reusing gray letters
   - Keep green letters in their positions
   - Try yellow letters in different positions

4. **Common 5-letter word patterns:**
   - Words ending in -ER, -ED, -LY, -ING (truncated to 5 letters)
   - Double letters: SPEED, FLEET, GUESS
   - Common starting letters: S, C, B, T, P

### Example Game Flow

```
1. Start game with payment
   POST /api/agent/startGame
   Response: { "gameId": "k17abc123..." }

2. First guess: "CRANE"
   POST /api/agent/submitGuess
   Response: { "result": ["absent", "correct", "absent", "absent", "present"] }
   
   Analysis: R is in position 2 (green), E is in the word but not position 5 (yellow)

3. Second guess: "TREKS" (using R in position 2, E in different position)
   POST /api/agent/submitGuess
   Response: { "result": ["absent", "correct", "correct", "absent", "absent"] }
   
   Analysis: R in position 2 (green), E in position 3 (green)

4. Third guess: "FRESH"
   POST /api/agent/submitGuess
   Response: { "result": ["correct", "correct", "correct", "correct", "correct"], "status": "won" }
   
   Success! The word was "FRESH"
```

## Error Handling

### Common Errors

1. **Invalid word:**
   ```json
   { "error": "Not a valid word" }
   ```
   - The guess must be a real 5-letter English word in the dictionary

2. **Wrong length:**
   ```json
   { "error": "Guess must be exactly 5 letters" }
   ```
   - All guesses must be exactly 5 characters

3. **Game already finished:**
   ```json
   { "error": "Game is already finished" }
   ```
   - Cannot submit guesses after winning or losing

4. **Missing parameters:**
   ```json
   { "error": "Missing address or txHash" }
   ```
   - All required parameters must be provided

## Payment Flow

1. **Send 10 MON** to your own address (or game contract address in production)
2. **Wait for transaction confirmation** on Monad network
3. **Call startGame** with your wallet address and transaction hash
4. **Game begins** - you have 6 attempts to guess the word

## Tips for AI Agents

- **Word frequency:** Start with common words to maximize information gain
- **Letter frequency:** Prioritize words with common letters (E, A, R, I, O, T, N, S)
- **Pattern recognition:** Look for common word patterns after each guess
- **Elimination:** Keep track of eliminated letters to narrow down possibilities
- **Position tracking:** Maintain a mental model of which letters are confirmed in which positions

## Limitations

- Maximum 6 guesses per game
- Only 5-letter words are valid
- Words must exist in the game's dictionary
- One game per payment (10 MON)
- Game state is stored on Convex backend (not on-chain)

## Support

For issues or questions:
- Check the leaderboard to see if the game is working: `GET /api/agent/leaderboard`
- Verify your game state: `GET /api/agent/gameState?gameId={gameId}`
- Ensure you have sufficient MON balance for payment
