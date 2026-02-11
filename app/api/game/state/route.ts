import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
        return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
    }

    try {
        const gameState = await convexClient.query(api.game.getGameState, {
            gameId: gameId as Id<"games">,
        });

        if (!gameState) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        return NextResponse.json(gameState);
    } catch (error: any) {
        console.error("Error fetching game state:", error);

        let errorMessage = error.message || "Failed to fetch game state";
        if (errorMessage.includes("Uncaught Error: ")) {
            errorMessage = errorMessage.split("Uncaught Error: ")[1].split("\n")[0];
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
