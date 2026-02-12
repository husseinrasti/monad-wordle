import { NextResponse } from "next/server";
import { convexClient } from "@/lib/convex-client";
import { api } from "@/convex/_generated/api";
import { createPublicClient, http, decodeEventLog } from "viem";
import { monadMainnet } from "@/lib/wagmi"; // Reusing the chain definition, we'll call it "Mainnet" in logic if needed
import gameAbi from "@/contract/abi.json";

const RPC_URL = process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://rpc3.monad.xyz";
const GAME_CONTRACT = process.env.NEXT_PUBLIC_WORDLE_GAME_CONTRACT as `0x${string}`;

const publicClient = createPublicClient({
    chain: monadMainnet,
    transport: http(RPC_URL),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, txHash } = body;

        if (!address || !txHash) {
            return NextResponse.json(
                { error: "Missing address or txHash" },
                { status: 400 }
            );
        }

        // 1. Fetch transaction receipt
        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            timeout: 60_000
        });

        // 2. Verify: The transaction was successful
        if (receipt.status !== "success") {
            return NextResponse.json({ error: "Transaction failed" }, { status: 400 });
        }

        // 3. Verify: The 'to' address matches the WordleGame contract address
        if (receipt.to?.toLowerCase() !== GAME_CONTRACT.toLowerCase()) {
            return NextResponse.json({ error: "Invalid contract recipient" }, { status: 400 });
        }

        // 4. Verify: The sender matches the authenticated wallet
        if (receipt.from.toLowerCase() !== address.toLowerCase()) {
            return NextResponse.json({ error: "Transaction sender mismatch" }, { status: 400 });
        }

        // 5. Verify: The transaction emitted the GamePlayed event
        let gamePlayedEventFound = false;
        for (const log of receipt.logs) {
            try {
                const event = decodeEventLog({
                    abi: gameAbi,
                    data: log.data,
                    topics: log.topics,
                });

                if (event.eventName === "GamePlayed") {
                    // Optionally verify the player address in the event
                    if ((event.args as any).player.toLowerCase() === address.toLowerCase()) {
                        gamePlayedEventFound = true;
                        break;
                    }
                }
            } catch (e) {
                // Not a GamePlayed event, ignore
                continue;
            }
        }

        if (!gamePlayedEventFound) {
            return NextResponse.json({ error: "GamePlayed event not found" }, { status: 400 });
        }

        // 6. Create game (Convex mutation also prevents replay attacks via txHash index)
        const gameId = await convexClient.mutation(api.game.createGame, {
            address,
            txHash,
        });

        return NextResponse.json({ gameId, message: "Game started successfully" });
    } catch (error: any) {
        console.error("Error starting game:", error);

        let errorMessage = error.message || "Failed to start game";
        if (errorMessage.includes("Uncaught Error: ")) {
            errorMessage = errorMessage.split("Uncaught Error: ")[1].split("\n")[0];
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
