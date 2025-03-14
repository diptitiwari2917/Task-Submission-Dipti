"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause, Shuffle } from "lucide-react";

type Flashcard = {
  question: string;
  answer: string;
};

type FlashcardsProps = {
  questions: Flashcard[];
};

export default function FlashcardsPage({ questions }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (questions.length > 0) {
      setShuffledQuestions(shuffleArray([...questions]));
    }
  }, [questions]);

  // Auto-play functionality (Moves to the next question)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, currentIndex]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") handleNext();
      if (event.key === "ArrowLeft") handlePrevious();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Toggle Question ↔ Answer
  const handleCardClick = () => {
    setShowAnswer((prev) => !prev);
  };

  const handleNext = () => {
    if (!shuffledQuestions.length) return;
    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (!shuffledQuestions.length) return;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleShuffle = () => {
    setShuffledQuestions(shuffleArray([...questions]));
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const shuffleArray = (arr: Flashcard[]) => arr.sort(() => Math.random() - 0.5);

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full space-y-6">
      {/* Controls (Autoplay & Shuffle) */}
      <div className="flex space-x-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-black hover:text-gray-600 transition p-3 rounded-lg bg-gray-300"
        >
          {isAutoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        <button onClick={handleShuffle} className="text-black hover:text-gray-600 transition p-3 rounded-lg bg-gray-300">
          <Shuffle className="w-6 h-6" />
        </button>
      </div>

      {/* Flashcard with Slide Animation */}
      <div
        className="relative bg-white w-[80%] max-w-4xl h-96 shadow-lg flex justify-center items-center text-3xl font-bold cursor-pointer rounded-2xl p-12 text-center text-black overflow-hidden"
        onClick={handleCardClick}
      >
        <AnimatePresence mode="wait">
          {showAnswer ? (
            <motion.div
              key={`answer-${currentIndex}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {shuffledQuestions[currentIndex]?.answer}
            </motion.div>
          ) : (
            <motion.div
              key={`question-${currentIndex}`}
              className="absolute inset-0 flex items-center justify-center"
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: "0%", opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {shuffledQuestions[currentIndex]?.question}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center space-x-12 mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`text-white hover:text-gray-400 transition ${
            currentIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft className="w-10 h-10" />
        </button>

        <span className="text-white text-xl font-semibold">
          {currentIndex + 1} / {shuffledQuestions.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentIndex === shuffledQuestions.length - 1}
          className={`text-white hover:text-gray-400 transition ${
            currentIndex === shuffledQuestions.length - 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
}
