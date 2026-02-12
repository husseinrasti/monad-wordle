---
name: monad-wordle
description: Play a 5-letter Wordle game on the Monad blockchain using $WORDLE tokens. Start games, submit guesses, and retrieve game state via HTTP API. Use when the user wants to play Wordle, interact with blockchain games, or test Monad network integration.
license: MIT
metadata:
  author: Hussein Rasti
  version: "3.0"
  network:
    chain: Monad Mainnet
    game_contract:
      address: 0x143c5Fd7186470d2d0b1465C10571874c43FD297
    token:
      address: 0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777
      symbol: WORDLE
  payment:
    cost_per_game: 100 WORDLE
  tags:
    - blockchain
    - game
    - wordle
    - monad
    - erc20
    - onchain-payment
---

# Monad Wordle Skill

This skill enables AI agents to play a 5-letter Wordle game on the Monad Mainnet blockhain. The game requires a payment of 100 $WORDLE tokens to start, and agents can submit guesses and retrieve game state through a clean HTTP API.

**Note: All token purchases and game operations must happen on Monad Mainnet.**

------------------------------------------------------------------------

## Dependencies
This skill does NOT directly execute blockchain transactions.

It requires:
- HTTP client capability
- Monad SKILL: https://clawhub.ai/portdeveloper/monad-development
- Nad.fun SKILL: https://nad.fun/skill.md
- Nad.fun Trading SKILL: https://nad.fun/trading.md

------------------------------------------------------------------------

## Prerequisites

Before starting a game:

1.  Wallet must be connected to Monad Mainnet
2.  Wallet must hold $MON
3.  Agent must swap $MON → $WORDLE on nad.fun
4.  Wallet must hold at least 100 $WORDLE
5.  Approve WordleGame contract to spend $WORDLE

------------------------------------------------------------------------

## Required Swap Flow

1.  Ensure wallet has sufficient $MON
2.  Use Nad.fun Trading SKILL
3.  Swap $MON → $WORDLE on Monad Mainnet
4.  Confirm $WORDLE balance ≥ 100

Without $MON, user cannot obtain $WORDLE.

------------------------------------------------------------------------

## Execution Flow

User → Agent
↓
Connect wallet to Monad Mainnet
↓
Check $WORDLE balance
↓
If insufficient → Swap $MON → $WORDLE via nad.fun
↓
Approve WordleGame contract
↓
Call playGame() on contract
↓
Receive txHash
↓
POST txHash to /api/game/start
↓
Game session created

------------------------------------------------------------------------

## Smart Contract Details

$WORDLE Token
- Address: `0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777`
- Symbol: WORDLE
- Decimals: 18

WordleGame Contract
- Address: `0x143c5Fd7186470d2d0b1465C10571874c43FD297`
- ABI: [gameAbi](https://github.com/husseinrasti/monad-wordle/blob/main/contract/abi.json)

------------------------------------------------------------------------

## Payment Flow

To play the game, an agent must follow these steps on **Monad Mainnet**:

1. **Connect to Monad Mainnet** with your wallet.
2. **Purchase $WORDLE tokens:** Purchase at least 100 $WORDLE tokens.
3. **Approve and Pay:** Call the `playGame()` function on the **WordleGame contract**.
4. **Start Game:** After payment, pass the transaction hash to the `/api/game/start` endpoint.

------------------------------------------------------------------------

## Payment Validation Rules

API must verify:

-   Transaction executed on Monad Mainnet
-   tx.to == WordleGame contract
-   ERC20 token == $WORDLE
-   Amount ≥ 100 $WORDLE
-   GamePlayed event emitted
-   txHash not previously used
-   Sender == provided address

Replay attacks must be prevented.

------------------------------------------------------------------------

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

------------------------------------------------------------------------

## Gameplay Strategy

### Recommended Approach

1. **Start with a strong opening word** containing common vowels and consonants:
   - "CRANE", "SLATE", "TRACE", "ADIEU", "AUDIO"

2. **Analyze the feedback:**
   - Green (correct): Letter is in the right position
   - Yellow (present): Letter exists but in wrong position
   - Gray (absent): Letter is not in the word

------------------------------------------------------------------------

## Error Handling

### Common Errors

1. **Transaction hash already used:** `{ "error": "Transaction hash already used" }`
2. **GamePlayed event not found:** `{ "error": "GamePlayed event not found" }`
3. **Not a valid word:** `{ "error": "Not a valid word" }`
4. **Wrong length:** `{ "error": "Guess must be exactly 5 letters" }`
5. **Game already finished:** `{ "error": "Game is already finished" }`

------------------------------------------------------------------------

## Capabilities

-   Verify on-chain $WORDLE payments
-   Start paid game sessions
-   Submit guesses
-   Retrieve leaderboard
-   Prevent replay attacks

------------------------------------------------------------------------

## Limitations

-   Cannot custody user funds
-   Cannot execute blockchain transactions without Monad SKILL
-   Only supports Monad Mainnet
-   Requires user to hold $MON before swapping

------------------------------------------------------------------------

## Support

For issues or questions, visit our website or contact the team.
