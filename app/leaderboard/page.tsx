"use client";

import { Leaderboard } from "@/components/leaderboard";

export default function LeaderboardPage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="text-center space-y-2 mb-8">
                        <h1 className="text-4xl font-bold tracking-tight">World Leaderboard</h1>
                        <p className="text-muted-foreground text-lg">
                            Top players competing on the Monad network.
                        </p>
                    </div>
                    <Leaderboard />
                </div>
            </main>
        </div>
    );
}
