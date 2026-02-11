"use client";

import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

interface KeyboardProps {
    onKeyPress: (key: string) => void;
    letterStatuses: Record<string, "correct" | "present" | "absent">;
    disabled?: boolean;
}

export function Keyboard({ onKeyPress, letterStatuses, disabled }: KeyboardProps) {
    const getKeyColor = (key: string) => {
        const status = letterStatuses[key.toLowerCase()];
        if (status === "correct") return "bg-green-500 text-white hover:bg-green-600";
        if (status === "present") return "bg-yellow-500 text-white hover:bg-yellow-600";
        if (status === "absent") return "bg-gray-500 text-white hover:bg-gray-600";
        return "bg-muted hover:bg-muted/80";
    };

    return (
        <div className="flex flex-col gap-2">
            {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="flex justify-center gap-1">
                    {row.map((key) => (
                        <Button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            disabled={disabled}
                            className={cn(
                                "h-12 font-bold transition-all",
                                key === "ENTER" || key === "⌫" ? "px-4" : "w-10 px-0",
                                getKeyColor(key)
                            )}
                            variant="secondary"
                        >
                            {key}
                        </Button>
                    ))}
                </div>
            ))}
        </div>
    );
}
