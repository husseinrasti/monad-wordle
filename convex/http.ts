import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

// Start a new game (for agents)
http.route({
    path: "/api/agent/startGame",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { address, txHash } = body;

        if (!address || !txHash) {
            return new Response(
                JSON.stringify({ error: "Missing address or txHash" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        try {
            const gameId = await ctx.runMutation(api.game.createGame, {
                address,
                txHash,
            });

            return new Response(
                JSON.stringify({ gameId, message: "Game started successfully" }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                }
            );
        } catch (error) {
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

// Submit a guess (for agents)
http.route({
    path: "/api/agent/submitGuess",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const { gameId, guess } = body;

        if (!gameId || !guess) {
            return new Response(
                JSON.stringify({ error: "Missing gameId or guess" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        try {
            const result = await ctx.runMutation(api.game.submitGuess, {
                gameId: gameId as Id<"games">,
                guess,
            });

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

// Get game state (for agents)
http.route({
    path: "/api/agent/gameState",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);
        const gameId = url.searchParams.get("gameId");

        if (!gameId) {
            return new Response(JSON.stringify({ error: "Missing gameId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        try {
            const gameState = await ctx.runQuery(api.game.getGameState, {
                gameId: gameId as Id<"games">,
            });

            if (!gameState) {
                return new Response(JSON.stringify({ error: "Game not found" }), {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                });
            }

            return new Response(JSON.stringify(gameState), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

// Get leaderboard (for agents)
http.route({
    path: "/api/agent/leaderboard",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        try {
            const leaderboard = await ctx.runQuery(api.game.getLeaderboard, {});

            return new Response(JSON.stringify(leaderboard), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

// Seed words (internal)
http.route({
    path: "/api/seed",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        try {
            const result = await ctx.runMutation(internal.seed.seedWords, {});

            return new Response(JSON.stringify(result), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({ error: (error as Error).message }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    }),
});

export default http;
