"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import { GameBoard } from "@/components/game-board";
import { Keyboard } from "@/components/keyboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GAME_COST = process.env.NEXT_PUBLIC_GAME_COST || "1";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");
  const [letterStatuses, setLetterStatuses] = useState<Record<string, "correct" | "present" | "absent">>({});

  // Fetch game state
  const { data: gameState, refetch: refetchGameState } = useQuery({
    queryKey: ["gameState", gameId],
    queryFn: async () => {
      if (!gameId) return null;
      const res = await fetch(`/api/game/state?gameId=${gameId}`);
      if (!res.ok) throw new Error("Failed to fetch game state");
      return res.json();
    },
    enabled: !!gameId,
  });

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Start game after payment is confirmed
  useEffect(() => {
    const startGame = async () => {
      if (isConfirmed && txHash && address) {
        try {
          const res = await fetch("/api/game/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address, txHash }),
          });

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to start game");
          }

          const data = await res.json();
          setGameId(data.gameId);
          setMessage("Game started! Good luck!");
        } catch (err: any) {
          setMessage(`Error: ${err.message}`);
        }
      }
    };

    startGame();
  }, [isConfirmed, txHash, address]);

  const handlePayment = () => {
    if (!address) {
      setMessage("Please connect your wallet first");
      return;
    }

    sendTransaction({
      to: address, // For MVP, sending to self. In production, send to game contract
      value: parseEther(GAME_COST),
    });
    setMessage("Processing payment... Please confirm in your wallet.");
  };

  const submitNewGuess = async (gameId: string, guess: string) => {
    const res = await fetch("/api/game/guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, guess }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to submit guess");
    }

    return res.json();
  };

  const handleKeyPress = useCallback(
    async (key: string) => {
      if (!gameId || !gameState || gameState.status !== "playing") return;

      if (key === "ENTER") {
        if (currentGuess.length !== 5) {
          setMessage("Word must be 5 letters!");
          return;
        }

        try {
          const result = await submitNewGuess(gameId, currentGuess);
          setCurrentGuess("");

          // Refetch game state to update board
          await refetchGameState();

          // Update letter statuses locally for immediate feedback 
          // (though refetch will eventually sync it)
          const newStatuses = { ...letterStatuses };
          currentGuess.split("").forEach((letter, i) => {
            const status = result.result[i];
            const lowerLetter = letter.toLowerCase();
            if (!newStatuses[lowerLetter] || status === "correct") {
              newStatuses[lowerLetter] = status;
            } else if (status === "present" && newStatuses[lowerLetter] !== "correct") {
              newStatuses[lowerLetter] = status;
            } else if (!newStatuses[lowerLetter]) {
              newStatuses[lowerLetter] = status;
            }
          });
          setLetterStatuses(newStatuses);

          if (result.status === "won") {
            setMessage("Congratulations! You won!");
          } else if (result.status === "lost") {
            setMessage(`Game over! The word was: ${gameState.word}`);
            // Need to refetch one more time to get the revealed word if lost
            setTimeout(() => refetchGameState(), 500);
          } else {
            setMessage(`${result.guessesRemaining} guesses remaining`);
          }
        } catch (err: any) {
          setMessage(err.message);
        }
      } else if (key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (currentGuess.length < 5 && key.length === 1) {
        setCurrentGuess((prev) => prev + key.toLowerCase());
      }
    },
    [gameId, gameState, currentGuess, letterStatuses, refetchGameState]
  );

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        handleKeyPress("⌫");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {!isConnected ? (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Monad Wordle! 🎮</CardTitle>
                <CardDescription>
                  Connect your wallet to start playing. Each game costs {GAME_COST} MON.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click the &quot;Connect Wallet&quot; button in the header to get started.
                </p>
              </CardContent>
            </Card>
          ) : !gameId ? (
            <Card>
              <CardHeader>
                <CardTitle>Start a New Game</CardTitle>
                <CardDescription>
                  Pay {GAME_COST} MON to start a new Wordle game. Guess the 5-letter word in 6 tries!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePayment}
                  disabled={isSending || isConfirming}
                  size="lg"
                  className="w-full"
                >
                  {isSending || isConfirming ? "Processing..." : `Pay ${GAME_COST} MON & Start Game`}
                </Button>
                {message && (
                  <p className="text-sm text-center text-muted-foreground">{message}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-sm font-normal text-muted-foreground">
                      {gameState?.status === "playing"
                        ? `${gameState.guessesRemaining} guesses left`
                        : gameState?.status === "won"
                          ? "You won!"
                          : "Game over"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <GameBoard
                      guesses={gameState?.guesses || []}
                      results={gameState?.results || []}
                      currentGuess={currentGuess}
                    />
                  </div>
                  <Keyboard
                    onKeyPress={handleKeyPress}
                    letterStatuses={letterStatuses}
                    disabled={gameState?.status !== "playing"}
                  />
                  {message && (
                    <p className="text-center text-sm font-medium">{message}</p>
                  )}
                  {gameState?.status !== "playing" && (
                    <Button
                      onClick={() => {
                        setGameId(null);
                        setCurrentGuess("");
                        setMessage("");
                        setLetterStatuses({});
                      }}
                      className="w-full"
                    >
                      Play Again ({GAME_COST} MON)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
