import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        address: v.string(),
        gamesPlayed: v.number(),
        gamesWon: v.number(),
        currentStreak: v.number(),
        maxStreak: v.number(),
    }).index("by_address", ["address"]),

    games: defineTable({
        userId: v.id("users"),
        word: v.string(),
        guesses: v.array(v.string()),
        status: v.union(
            v.literal("playing"),
            v.literal("won"),
            v.literal("lost")
        ),
        txHash: v.string(),
        createdAt: v.number(),
    }).index("by_user", ["userId"])
        .index("by_txHash", ["txHash"]),

    words: defineTable({
        text: v.string(),
    }).index("by_text", ["text"]),
});
