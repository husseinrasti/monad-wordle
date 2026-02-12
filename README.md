# Wordle on Monad -- \$WORDLE Powered Game

A 5-letter Wordle-style game built on **Monad Mainnet**, powered by the
\$WORDLE ERC20 token.

Players must own and spend **100 \$WORDLE tokens** to start a game.\
The entire game logic runs off-chain, while payment validation happens
on-chain using a dedicated smart contract.

------------------------------------------------------------------------

## 🚀 Overview

This project is a full-stack Web3 Wordle game with:

-   🔐 Wallet-based authentication (wagmi)
-   🪙 \$WORDLE ERC20 token payment model
-   🎮 On-chain payment validation
-   ⚡ Off-chain game logic
-   🗄 Convex backend (database + API)
-   🤖 AI Agent support via SKILL.md
-   📊 Backend-managed leaderboard
-   🌐 Deployed on Monad Mainnet

------------------------------------------------------------------------

## 🧱 Architecture

User / Agent\
↓\
Next.js App (UI + API routes)\
↓\
Payment Validation Layer (Monad RPC)\
↓\
Convex Backend (DB + Game Logic)\
↓\
WordleGame Smart Contract

------------------------------------------------------------------------

## 🪙 Token & Contract

### \$WORDLE Token

Token Address: 0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777

### WordleGame Contract

Contract Address: 0x143c5Fd7186470d2d0b1465C10571874c43FD297

### Entry Fee

100 \$WORDLE

The entry fee is enforced on-chain by the contract.

------------------------------------------------------------------------

## 🎮 How Playing Works

1.  User connects wallet (Monad Mainnet)
2.  User buys at least 100 \$WORDLE from nad.fun
3.  User approves the WordleGame contract
4.  User calls `playGame()` on the contract
5.  Transaction hash is sent to backend `/api/game/start`
6.  Backend validates:
    -   Transaction success
    -   Contract address match
    -   `GamePlayed` event emitted
    -   Sender matches wallet
    -   Tx hash not previously used
7.  Game session starts

------------------------------------------------------------------------

## 🔐 Payment Validation (Security Model)

Inside the API `start` route:

-   Fetch tx receipt from Monad Mainnet RPC
-   Confirm:
    -   `to` == WordleGame contract
    -   `status == success`
    -   `GamePlayed` event exists
    -   Sender matches authenticated wallet
-   Store txHash in database
-   Prevent replay attacks

Game does NOT start unless validation passes.

------------------------------------------------------------------------

## 🏆 Leaderboard

Leaderboard is:

-   Fully off-chain
-   Stored in Convex database
-   Based on wins, attempts, and completion time
-   Displayed in a dedicated tab

------------------------------------------------------------------------

## 🤖 AI Agent Integration

Agents can interact using the public API.

### Requirements for Agents

-   Must connect to Monad Mainnet
-   Must own at least 100 \$WORDLE
-   Must call `playGame()` before starting
-   Must pass txHash to `/api/game/start`

### Helpful Skills

Monad Development SKILL:
https://clawhub.ai/portdeveloper/monad-development

Nad.fun SKILL: https://clawhub.ai/zaki9501/nadfun-skill

nad.fun Trading SKILL: https://nad.fun/trading.md

SKILL file: https://wordle.nadnation.xyz/SKILL.md

------------------------------------------------------------------------

## 🛠 Tech Stack

Frontend: - Next.js - TypeScript - wagmi - viem

Backend: - Convex - Next.js API routes

Blockchain: - Monad Mainnet - ERC20 (\$WORDLE) - WordleGame contract

------------------------------------------------------------------------

## ⚙️ Environment Variables

Create `.env.local`:

NEXT_PUBLIC_WORDLE_GAME_CONTRACT=0x143c5Fd7186470d2d0b1465C10571874c43FD297\
NEXT_PUBLIC_WORDLE_TOKEN=0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777\
NEXT_PUBLIC_MONAD_RPC=https://rpc.monad.xyz

------------------------------------------------------------------------

## 🔄 API Endpoints

POST /api/auth/verify\
POST /api/game/start\
POST /api/game/guess\
GET /api/game/state\
GET /api/leaderboard

------------------------------------------------------------------------

## 🌍 Network Requirements

Monad Mainnet\
Chain ID: 143\
RPC: https://rpc.monad.xyz

------------------------------------------------------------------------

## 📜 License

MIT

------------------------------------------------------------------------

## 👑 Built for the Monad Ecosystem
