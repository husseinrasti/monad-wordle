import { internalMutation } from "./_generated/server";
import { FIVE_LETTER_WORDS } from "./words";

export const seedWords = internalMutation({
    handler: async (ctx) => {
        // Check if words are already seeded
        const existingWords = await ctx.db.query("words").first();
        if (existingWords) {
            console.log("Words already seeded");
            return { message: "Words already seeded", count: 0 };
        }

        // Insert all words
        let count = 0;
        for (const word of FIVE_LETTER_WORDS) {
            await ctx.db.insert("words", { text: word.toLowerCase() });
            count++;
        }

        return { message: "Words seeded successfully", count };
    },
});
