import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export async function GET() {
    try {
        const leaderboard = await convexClient.query(api.game.getLeaderboard, {});
        return NextResponse.json(leaderboard);
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);

        let errorMessage = error.message || "Failed to fetch leaderboard";
        if (errorMessage.includes("Uncaught Error: ")) {
            errorMessage = errorMessage.split("Uncaught Error: ")[1].split("\n")[0];
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
