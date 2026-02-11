import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, txHash } = body;

        if (!address || !txHash) {
            return NextResponse.json(
                { error: "Missing address or txHash" },
                { status: 400 }
            );
        }

        // TODO: Add logic to verify txHash or signature here if needed
        // For now, we trust the client provided hash as proof of intent

        const gameId = await convexClient.mutation(api.game.createGame, {
            address,
            txHash,
        });

        return NextResponse.json({ gameId, message: "Game started successfully" });
    } catch (error: any) {
        console.error("Error starting game:", error);

        let errorMessage = error.message || "Failed to start game";
        if (errorMessage.includes("Uncaught Error: ")) {
            errorMessage = errorMessage.split("Uncaught Error: ")[1].split("\n")[0];
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
