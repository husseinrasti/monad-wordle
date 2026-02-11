"use client";

import { cn } from "@/lib/utils";

type TileStatus = "correct" | "present" | "absent" | "empty";

interface GameBoardProps {
    guesses: string[];
    results: TileStatus[][];
    currentGuess: string;
    maxGuesses?: number;
}

export function GameBoard({
    guesses,
    results,
    currentGuess,
    maxGuesses = 6,
}: GameBoardProps) {
    const rows = [];

    // Render submitted guesses
    for (let i = 0; i < guesses.length; i++) {
        const guess = guesses[i];
        const result = results[i];
        rows.push(
            <div key={i} className="flex gap-2">
                {guess.split("").map((letter, j) => (
                    <div
                        key={j}
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-md border-2 text-2xl font-bold uppercase transition-all",
                            result[j] === "correct" &&
                            "border-green-500 bg-green-500 text-white",
                            result[j] === "present" &&
                            "border-yellow-500 bg-yellow-500 text-white",
                            result[j] === "absent" && "border-gray-500 bg-gray-500 text-white"
                        )}
                    >
                        {letter}
                    </div>
                ))}
            </div>
        );
    }

    // Render current guess row
    if (guesses.length < maxGuesses) {
        rows.push(
            <div key="current" className="flex gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                    <div
                        key={j}
                        className={cn(
                            "flex h-14 w-14 items-center justify-center rounded-md border-2 text-2xl font-bold uppercase transition-all",
                            currentGuess[j]
                                ? "border-primary animate-pulse"
                                : "border-muted"
                        )}
                    >
                        {currentGuess[j] || ""}
                    </div>
                ))}
            </div>
        );
    }

    // Render empty rows
    for (let i = rows.length; i < maxGuesses; i++) {
        rows.push(
            <div key={i} className="flex gap-2">
                {Array.from({ length: 5 }).map((_, j) => (
                    <div
                        key={j}
                        className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-muted text-2xl font-bold uppercase"
                    />
                ))}
            </div>
        );
    }

    return <div className="flex flex-col gap-2">{rows}</div>;
}
