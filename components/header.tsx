"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
    const pathname = usePathname();

    const navItems = [
        { label: "Play", href: "/" },
        { label: "Leaderboard", href: "/leaderboard" },
        { label: "Agent", href: "/agent" },
    ];

    return (
        <header className="border-b border-border bg-card sticky top-0 z-50">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Monad Wordle
                        </h1>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <ConnectKitButton />
                </div>
            </div>
        </header>
    );
}
