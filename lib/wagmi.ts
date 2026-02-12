import { http, createConfig } from "wagmi";
import { defineChain } from "viem";
import { getDefaultConfig } from "connectkit";

// Define Monad Testnet chain
export const monadTestnet = defineChain({
    id: 10143, // Monad Testnet Chain ID
    name: "Monad Testnet",
    nativeCurrency: {
        decimals: 18,
        name: "Monad",
        symbol: "MON",
    },
    rpcUrls: {
        default: {
            http: ["https://testnet-rpc.monad.xyz"],
        },
    },
    blockExplorers: {
        default: { name: "Monad Explorer", url: "https://testnet.monadvision.com" },
    },
    testnet: true,
});

// Define Monad Mainnet chain
export const monadMainnet = defineChain({
    id: 143, // Monad Chain ID
    name: "Monad",
    nativeCurrency: {
        decimals: 18,
        name: "Monad",
        symbol: "MON",
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://rpc3.monad.xyz"],
        },
    },
    blockExplorers: {
        default: { name: "Monad Explorer", url: "https://monadvision.com" },
    },
});

export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [monadMainnet],
        transports: {
            [monadMainnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://rpc3.monad.xyz"),
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

