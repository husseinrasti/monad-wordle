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
            http: [process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://monad-mainnet.drpc.org"],
        },
    },
    blockExplorers: {
        default: { name: "Monad Explorer", url: "https://monadvision.com" },
    },
});
