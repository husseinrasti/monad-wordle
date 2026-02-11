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
            http: ["https://testnet-rpc.monad.xyz"],
        },
    },
    blockExplorers: {
        default: { name: "Monad Explorer", url: "https://testnet.monadvision.com" },
    },
    testnet: true,
});

export const config = createConfig({
    chains: [monadTestnet],
    transports: {
        [monadTestnet.id]: http(),
    },
});
