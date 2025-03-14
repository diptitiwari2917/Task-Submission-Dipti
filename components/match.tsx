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
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [incorrectPairs, setIncorrectPairs] = useState<number[]>([]);
  const [time, setTime] = useState(0);
  const [cards, setCards] = useState<Card[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    startGame();
  }, [questions]);

  // Start Timer
  useEffect(() => {
    if (isComplete) return; // Stop timer when complete
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isComplete]);

  // Shuffle and create question-answer pairs
  const startGame = () => {
    setTime(0);
    setIsComplete(false);
    setSelectedCards([]);
    setMatchedPairs([]);
    setIncorrectPairs([]);
    const generatedPairs: Card[] = questions.flatMap((q, index) => [
      { id: index * 2, text: q.question, pairId: index, hidden: false },
      { id: index * 2 + 1, text: q.answer, pairId: index, hidden: false },
    ]);
    setCards(shuffleArray(generatedPairs));
  };

  // Shuffle Array
  const shuffleArray = (arr: Card[]) => arr.sort(() => Math.random() - 0.5);

  // Handle card selection
  const handleSelect = (id: number, pairId: number) => {
    if (selectedCards.includes(id)) return;

    const newSelected = [...selectedCards, id];

    if (newSelected.length === 2) {
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Correct match
        setMatchedPairs((prev) => [...prev, firstCard.pairId]);
        setTimeout(() => {
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

  // Check if all pairs are matched
  const checkCompletion = () => {
    setTimeout(() => {
      if (matchedPairs.length + 1 === questions.length) {
        setIsComplete(true);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-gray-300 p-6">
      {/* Timer */}
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
