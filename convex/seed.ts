import { internalMutation } from "./_generated/server";
import { FIVE_LETTER_WORDS } from "./words";

export const seedWords = internalMutation({
    handler: async (ctx) => {
        // Get all existing words
        const existingWords = await ctx.db.query("words").collect();
        const existingWordSet = new Set(existingWords.map((w) => w.text));

        // Insert missing words
        let count = 0;
        for (const word of FIVE_LETTER_WORDS) {
            const normalizedWord = word.toLowerCase();
            if (!existingWordSet.has(normalizedWord)) {
                await ctx.db.insert("words", { text: normalizedWord });
                count++;
            }
        }

        if (count > 0) {
            return { message: `Added ${count} new words`, count };
        } else {
            return { message: "All words already seeded", count: 0 };
        }
    },
});
