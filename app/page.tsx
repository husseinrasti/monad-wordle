"use client";

import { useState, useEffect, useCallback } from "react";
import { parseUnits, erc20Abi } from "viem";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain, useChainId } from "wagmi";
import { monadMainnet } from "@/lib/wagmi";
import gameAbi from "@/contract/abi.json";
import { GameBoard } from "@/components/game-board";
import { Keyboard } from "@/components/keyboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GAME_COST = process.env.NEXT_PUBLIC_GAME_COST || "100";
const WORDLE_TOKEN = process.env.NEXT_PUBLIC_WORDLE_TOKEN_ADDRESS as `0x${string}`;
const WORDLE_GAME = process.env.NEXT_PUBLIC_WORDLE_GAME_CONTRACT as `0x${string}`;

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const activeChainId = useChainId();
  const { switchChain } = useSwitchChain();
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

  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: allowance } = useReadContract({
    address: WORDLE_TOKEN,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, WORDLE_GAME] : undefined,
    chainId: monadMainnet.id,
    query: {
      enabled: !!address,
    }
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash || undefined,
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
          setTxHash(null);
        } catch (err: any) {
          setMessage(`Error: ${err.message}`);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    if (isConfirmed) {
      startGame();
    }
  }, [isConfirmed, txHash, address]);

  const handlePayment = async () => {
    if (!address) {
      setMessage("Please connect your wallet first");
      return;
    }

    try {
      setIsProcessing(true);
      setMessage("Checking token allowance...");

      const cost = parseUnits(GAME_COST, 18);

      // 1. Check/Request Approval if needed
      if (!allowance || allowance < cost) {
        setMessage("Approving $WORDLE tokens...");
        const approveHash = await writeContractAsync({
          address: WORDLE_TOKEN,
          abi: erc20Abi,
          functionName: "approve",
          args: [WORDLE_GAME, cost],
          chainId: monadMainnet.id,
        });
        setMessage("Approval pending... please wait.");
      }

      // 2. Call playGame
      setMessage("Starting game... Please confirm in your wallet.");
      const gameTxHash = await writeContractAsync({
        address: WORDLE_GAME,
        abi: gameAbi,
        functionName: "playGame",
        chainId: monadMainnet.id,
      });

      setTxHash(gameTxHash);
      setMessage("Transaction sent! Waiting for confirmation...");
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.shortMessage || err.message}`);
      setIsProcessing(false);
    }
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
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-primary/5">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="relative w-16 h-16 rounded-2xl border border-primary/20 bg-background flex items-center justify-center p-2 shadow-inner">
                  <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Welcome to Monad Wordle!</CardTitle>
                  <CardDescription>
                    Connect your wallet to start playing. Each game costs {GAME_COST} $WORDLE.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click the &quot;Connect Wallet&quot; button in the header to get started.
                </p>
              </CardContent>
            </Card>
          ) : !gameId ? (
            <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-primary/5">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="relative w-16 h-16 rounded-2xl border border-primary/20 bg-background flex items-center justify-center p-2 shadow-inner">
                  <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Start a New Game</CardTitle>
                  <CardDescription>
                    Pay {GAME_COST} $WORDLE to start a new Wordle game. Guess the 5-letter word in 6 tries!
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {chain?.id !== monadMainnet.id ? (
                  <Button
                    onClick={() => switchChain({ chainId: monadMainnet.id })}
                    size="lg"
                    className="w-full"
                    variant="destructive"
                  >
                    Switch to Monad Mainnet
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || isConfirming}
                    size="lg"
                    className="w-full"
                  >
                    {isProcessing || isConfirming ? "Processing..." : `Pay ${GAME_COST} $WORDLE & Start Game`}
                  </Button>
                )}
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
                      Play Again ({GAME_COST} $WORDLE)
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
