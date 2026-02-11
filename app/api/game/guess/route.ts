import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { gameId, guess } = body;

        if (!gameId || !guess) {
            return NextResponse.json(
                { error: "Missing gameId or guess" },
                { status: 400 }
            );
        }

        const result = await convexClient.mutation(api.game.submitGuess, {
            gameId: gameId as Id<"games">,
            guess,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error submitting guess:", error);

        let errorMessage = error.message || "Failed to submit guess";
        if (errorMessage.includes("Uncaught Error: ")) {
            errorMessage = errorMessage.split("Uncaught Error: ")[1].split("\n")[0];
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}
