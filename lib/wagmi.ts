import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

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
            http: ["https://testnet.monad.xyz"],
        },
    },
    blockExplorers: {
        default: { name: "Monad Explorer", url: "https://explorer.testnet.monad.xyz" },
    },
    testnet: true,
});

export const config = createConfig({
    chains: [monadTestnet],
    transports: {
        [monadTestnet.id]: http(),
    },
});
