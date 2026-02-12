"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { ThemeToggle } from "./theme-toggle";
import Image from "next/image";
import { Button } from "@/components/ui/button";

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
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Image
                                src="/logo.png"
                                alt="Monad Wordle Logo"
                                width={40}
                                height={40}
                                className="object-contain"
                                priority
                            />
                        </div>
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
                    <Link
                        href="https://nad.fun/tokens/0xAfcECBd7c43ABbDB10C394ad03C9D88ec8377777"
                        target="_blank"
                    >
                        <Button variant="outline" className="font-bold border-primary/50 hover:bg-primary/10">
                            Buy $WORDLE
                        </Button>
                    </Link>
                    <ConnectKitButton />
                </div>
            </div>
        </header>
    );
}
