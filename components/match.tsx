"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type MatchPair = {
  question: string;
  answer: string;
};

type MatchGameProps = {
  questions: MatchPair[];
};

type Card = {
  id: number;
  text: string;
  pairId: number;
  hidden: boolean;
};

export default function Match({ questions }: MatchGameProps) {
  // State to track selected cards
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  // State to track matched pairs
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  // State to track incorrect selections
  const [incorrectPairs, setIncorrectPairs] = useState<number[]>([]);
  // Timer state
  const [time, setTime] = useState(0);
  // State to store shuffled cards
  const [cards, setCards] = useState<Card[]>([]);
  // State to track if the game is completed
  const [isComplete, setIsComplete] = useState(false);

  // Initialize the game when questions change
  useEffect(() => {
    startGame();
  }, [questions]);

  // Timer effect: increases time every second until game is completed
  useEffect(() => {
    if (isComplete) return; // Stop timer when complete
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  /**
   * Initializes the game by shuffling question-answer pairs and resetting states.
   */
  const startGame = () => {
    setTime(0);
    setIsComplete(false);
    setSelectedCards([]);
    setMatchedPairs([]);
    setIncorrectPairs([]);

    // Generate shuffled card pairs from questions
    const generatedPairs: Card[] = questions.flatMap((q, index) => [
      { id: index * 2, text: q.question, pairId: index, hidden: false },
      { id: index * 2 + 1, text: q.answer, pairId: index, hidden: false },
    ]);

    setCards(shuffleArray(generatedPairs));
  };

  /**
   * Shuffles the card array randomly.
   * @param arr - Array of cards to shuffle.
   * @returns - Shuffled array of cards.
   */
  const shuffleArray = (arr: Card[]) => arr.sort(() => Math.random() - 0.5);

  /**
   * Handles card selection logic.
   * @param id - ID of the selected card.
   * @param pairId - Pair ID associated with the card.
   */
  const handleSelect = (id: number, pairId: number) => {
    if (selectedCards.includes(id)) return; // Prevent selecting the same card twice

    const newSelected = [...selectedCards, id];

    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Correct match
        setMatchedPairs((prev) => [...prev, firstCard.pairId]);
        setTimeout(() => {
          // Hide matched pairs from the board
          setCards((prev) =>
            prev.map((card) =>
              card.pairId === firstCard.pairId ? { ...card, hidden: true } : card
            )
          );
          checkCompletion();
        }, 2000);
      } else {
        // Incorrect match
        setIncorrectPairs(newSelected);
        setTimeout(() => setIncorrectPairs([]), 1500);
      }
      setSelectedCards([]);
    } else {
      setSelectedCards(newSelected);
    }
  };

  /**
   * Checks if all pairs have been matched and ends the game.
   */
  const checkCompletion = () => {
    setTimeout(() => {
      if (matchedPairs.length + 1 === questions.length) {
        setIsComplete(true);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-gray-300 p-6">
      {/* Timer Display */}
      <h2 className="text-xl font-semibold mb-6 text-gray-400">Time: {time} sec</h2>

      {/* Match Grid */}
      <div className="grid grid-cols-4 gap-4 max-w-full">
        {cards.map(({ id, text, pairId, hidden }) => {
          const isSelected = selectedCards.includes(id);
          const isMatched = matchedPairs.includes(pairId);
          const isIncorrect = incorrectPairs.includes(id);

          return (
            <motion.div
              key={id}
              onClick={() => !isMatched && !hidden && handleSelect(id, pairId)}
              className={`p-1 w-65 h-40 flex justify-center items-center text-lg font-semibold text-center
                border-2 cursor-pointer rounded-lg transition-all duration-300
                ${hidden ? "invisible" : ""}
                ${isMatched ? "bg-green-600 text-white" : "bg-gray-800"}
                ${isIncorrect ? "border-red-500" : "border-gray-500"}
                ${isSelected ? "bg-yellow-300 text-black border-yellow-400" : ""}
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {text}
            </motion.div>
          );
        })}
      </div>

      {/* Completion Modal */}
      <Dialog open={isComplete} onOpenChange={setIsComplete}>
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg">
          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="text-lg font-semibold mt-4">
              🎉 Congratulations!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-gray-300">
            You completed the game in <span className="font-bold text-green-400">{time} sec</span>!
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700">
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
