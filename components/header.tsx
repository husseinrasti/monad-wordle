"use client";

import { ConnectKitButton } from "connectkit";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Monad Wordle
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <ConnectKitButton />
                </div>
            </div>
        </header>
    );
}
