"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { config } from "@/lib/wagmi";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ConvexProvider client={convex}>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <ConnectKitProvider>{children}</ConnectKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </ConvexProvider>
    );
}
