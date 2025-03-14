"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  // Shuffle and create question-answer pairs
  useEffect(() => {
    const generatedPairs: Card[] = questions.flatMap((q, index) => [
      { id: index * 2, text: q.question, pairId: index, hidden: false },
      { id: index * 2 + 1, text: q.answer, pairId: index, hidden: false },
    ]);
    setCards(shuffleArray(generatedPairs));
  }, [questions]);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
              className={`p-1 w-65 h-50 flex justify-center items-center text-lg font-semibold text-center
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
    </div>
  );
}
