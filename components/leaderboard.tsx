"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface LeaderboardEntry {
    rank: number;
    address: string;
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    currentStreak: number;
    maxStreak: number;
}

export function Leaderboard() {
    const { data: leaderboard } = useQuery<LeaderboardEntry[]>({
        queryKey: ["leaderboard"],
        queryFn: async () => {
            const res = await fetch("/api/game/leaderboard");
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            return res.json();
        },
    });

    if (!leaderboard) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>🏆</span>
                    <span>Leaderboard</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {leaderboard.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No players yet. Be the first!</p>
                    ) : (
                        leaderboard.map((player) => (
                            <div
                                key={player.address}
                                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-primary">
                                        #{player.rank}
                                    </span>
                                    <div>
                                        <p className="font-mono text-sm">
                                            {player.address.slice(0, 6)}...{player.address.slice(-4)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {player.gamesWon} wins • {player.winRate}% win rate
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold">{player.maxStreak} 🔥</p>
                                    <p className="text-xs text-muted-foreground">Max Streak</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
