"use client";

import { http, createConfig } from "wagmi";
import { getDefaultConfig } from "connectkit";
import { monadMainnet, monadTestnet } from "./chains";
export { monadMainnet, monadTestnet };


export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [monadMainnet],
        transports: {
            [monadMainnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://monad-mainnet.drpc.org"),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",

        // Required App Info
        appName: "Monad Wordle",

        // Optional App Info
        appDescription: "Play Wordle on Monad",
        appUrl: "https://wordle.nadnation.xyz/", // your app's url
        appIcon: "https://wordle.nadnation.xyz/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
    })
);

