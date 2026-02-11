import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";

export async function GET() {
    try {
        const leaderboard = await convexClient.query(api.game.getLeaderboard, {});
        return NextResponse.json(leaderboard);
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch leaderboard" },
            { status: 500 }
        );
    }
}
