"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/header";
import { GameBoard } from "@/components/game-board";
import { Keyboard } from "@/components/keyboard";
import { Leaderboard } from "@/components/leaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [gameId, setGameId] = useState<Id<"games"> | null>(null);
  const [currentGuess, setCurrentGuess] = useState("");
  const [message, setMessage] = useState("");
  const [letterStatuses, setLetterStatuses] = useState<Record<string, "correct" | "present" | "absent">>({});

  const createGame = useMutation(api.game.createGame);
  const submitGuess = useMutation(api.game.submitGuess);
  const gameState = useQuery(api.game.getGameState, gameId ? { gameId } : "skip");

  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Start game after payment is confirmed
  useEffect(() => {
    if (isConfirmed && txHash && address) {
      createGame({ address, txHash })
        .then((id) => {
          setGameId(id);
          setMessage("Game started! Good luck! 🎮");
        })
        .catch((err) => {
          setMessage(`Error: ${err.message}`);
        });
    }
  }, [isConfirmed, txHash, address, createGame]);

  const handlePayment = () => {
    if (!address) {
      setMessage("Please connect your wallet first");
      return;
    }

    sendTransaction({
      to: address, // For MVP, sending to self. In production, send to game contract
      value: parseEther("10"),
    });
    setMessage("Processing payment... Please confirm in your wallet.");
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
          const result = await submitGuess({ gameId, guess: currentGuess });
          setCurrentGuess("");

          // Update letter statuses
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
            setMessage("🎉 Congratulations! You won!");
          } else if (result.status === "lost") {
            setMessage(`😢 Game over! The word was: ${gameState.word}`);
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
    [gameId, gameState, currentGuess, submitGuess, letterStatuses]
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
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            {!isConnected ? (
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to Monad Wordle! 🎮</CardTitle>
                  <CardDescription>
                    Connect your wallet to start playing. Each game costs 10 MON.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click the "Connect Wallet" button in the header to get started.
                  </p>
                </CardContent>
              </Card>
            ) : !gameId ? (
              <Card>
                <CardHeader>
                  <CardTitle>Start a New Game</CardTitle>
                  <CardDescription>
                    Pay 10 MON to start a new Wordle game. Guess the 5-letter word in 6 tries!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={handlePayment}
                    disabled={isSending || isConfirming}
                    size="lg"
                    className="w-full"
                  >
                    {isSending || isConfirming ? "Processing..." : "Pay 10 MON & Start Game"}
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
                      <span>Monad Wordle</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {gameState?.status === "playing"
                          ? `${gameState.guessesRemaining} guesses left`
                          : gameState?.status === "won"
                            ? "You won! 🎉"
                            : "Game over 😢"}
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
                        Play Again (10 MON)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <div>
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}
