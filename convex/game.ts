import { mutation, query } from "./_generated/server";
import { v } from "convex/values";



// Create a new game
export const createGame = mutation({
    args: {
        address: v.string(),
        txHash: v.string(),
    },
    handler: async (ctx, args) => {
        // Prevent replay attacks
        const existingTx = await ctx.db
            .query("games")
            .withIndex("by_txHash", (q) => q.eq("txHash", args.txHash))
            .first();

        if (existingTx) {
            throw new Error("Transaction hash already used");
        }

        // Get or create user
        let userId;
        const existing = await ctx.db
            .query("users")
            .withIndex("by_address", (q) => q.eq("address", args.address))
            .first();

        if (existing) {
            userId = existing._id;
        } else {
            userId = await ctx.db.insert("users", {
                address: args.address,
                gamesPlayed: 0,
                gamesWon: 0,
                currentStreak: 0,
                maxStreak: 0,
            });
        }

        // Get random word from database
        const words = await ctx.db.query("words").collect();
        if (words.length === 0) {
            throw new Error("No words in database. Please seed the database first.");
        }

        const randomWord = words[Math.floor(Math.random() * words.length)];

        // Create game
        const gameId = await ctx.db.insert("games", {
            userId,
            word: randomWord.text,
            guesses: [],
            status: "playing",
            txHash: args.txHash,
            createdAt: Date.now(),
        });

        // Update user stats
        const user = await ctx.db.get(userId);
        if (user) {
            await ctx.db.patch(userId, {
                gamesPlayed: user.gamesPlayed + 1,
            });
        }

        return gameId;
    },
});

// Submit a guess
export const submitGuess = mutation({
    args: {
        gameId: v.id("games"),
        guess: v.string(),
    },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game) {
            throw new Error("Game not found");
        }

        if (game.status !== "playing") {
            throw new Error("Game is already finished");
        }

        // Validate guess length
        const normalizedGuess = args.guess.toLowerCase().trim();
        if (normalizedGuess.length !== 5) {
            throw new Error("Guess must be exactly 5 letters");
        }

        // Check if word exists in dictionary
        const wordExists = await ctx.db
            .query("words")
            .withIndex("by_text", (q) => q.eq("text", normalizedGuess))
            .first();

        if (!wordExists) {
            throw new Error("Not a valid word");
        }

        // Add guess to game
        const newGuesses = [...game.guesses, normalizedGuess];
        const maxGuesses = 6;

        // Calculate result for this guess
        const result = calculateGuessResult(normalizedGuess, game.word);

        // Check if won
        const won = normalizedGuess === game.word;
        const lost = !won && newGuesses.length >= maxGuesses;

        let newStatus: "playing" | "won" | "lost" = game.status;
        if (won) {
            newStatus = "won";
            // Update user stats
            const user = await ctx.db.get(game.userId);
            if (user) {
                await ctx.db.patch(game.userId, {
                    gamesWon: user.gamesWon + 1,
                    currentStreak: user.currentStreak + 1,
                    maxStreak: Math.max(user.maxStreak, user.currentStreak + 1),
                });
            }
        } else if (lost) {
            newStatus = "lost";
            // Reset streak
            const user = await ctx.db.get(game.userId);
            if (user) {
                await ctx.db.patch(game.userId, {
                    currentStreak: 0,
                });
            }
        }

        // Update game
        await ctx.db.patch(args.gameId, {
            guesses: newGuesses,
            status: newStatus,
        });

        return {
            result,
            status: newStatus,
            guessesRemaining: maxGuesses - newGuesses.length,
        };
    },
});

// Get game state
export const getGameState = query({
    args: { gameId: v.id("games") },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId);
        if (!game) {
            return null;
        }

        // Calculate results for all guesses
        const results = game.guesses.map((guess) =>
            calculateGuessResult(guess, game.word)
        );

        return {
            gameId: game._id,
            status: game.status,
            guesses: game.guesses,
            results,
            guessesRemaining: 6 - game.guesses.length,
            // Only reveal word if game is finished
            word: game.status !== "playing" ? game.word : undefined,
        };
    },
});

// Get leaderboard
export const getLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();

        // Sort by games won, then by max streak
        const sorted = users
            .sort((a, b) => {
                if (b.gamesWon !== a.gamesWon) {
                    return b.gamesWon - a.gamesWon;
                }
                return b.maxStreak - a.maxStreak;
            })
            .slice(0, 10); // Top 10

        return sorted.map((user, index) => ({
            rank: index + 1,
            address: user.address,
            gamesPlayed: user.gamesPlayed,
            gamesWon: user.gamesWon,
            winRate:
                user.gamesPlayed > 0
                    ? Math.round((user.gamesWon / user.gamesPlayed) * 100)
                    : 0,
            currentStreak: user.currentStreak,
            maxStreak: user.maxStreak,
        }));
    },
});

// Helper function to calculate guess result
function calculateGuessResult(
    guess: string,
    word: string
): ("correct" | "present" | "absent")[] {
    const result: ("correct" | "present" | "absent")[] = [];
    const wordLetters = word.split("");
    const guessLetters = guess.split("");

    // First pass: mark correct letters
    const remainingWordLetters = [...wordLetters];
    const remainingGuessLetters = [...guessLetters];

    for (let i = 0; i < 5; i++) {
        if (guessLetters[i] === wordLetters[i]) {
            result[i] = "correct";
            remainingWordLetters[i] = "";
            remainingGuessLetters[i] = "";
        }
    }

    // Second pass: mark present letters
    for (let i = 0; i < 5; i++) {
        if (result[i] === "correct") continue;

        const letter = guessLetters[i];
        const indexInWord = remainingWordLetters.indexOf(letter);

        if (indexInWord !== -1) {
            result[i] = "present";
            remainingWordLetters[indexInWord] = "";
        } else {
            result[i] = "absent";
        }
    }

    return result;
}
