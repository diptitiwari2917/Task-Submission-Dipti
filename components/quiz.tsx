"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, X, Printer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuizScore from "@/components/score";
import { Question } from "@/lib/schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type QuizProps = {
  questions: Question[];
};

export default function QuizComponent({ questions }: QuizProps) {
  // State variables
  const [answers, setAnswers] = useState<{ [key: number]: string | null }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // References for scrolling and timing
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);

  // Start the timer when the component mounts
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  /**
   * Handles selecting an answer for a question.
   * @param questionIndex - Index of the question.
   * @param answer - Selected answer option.
   */
  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (!isSubmitted) {
      setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
    }
  };

  /**
   * Handles skipping a question and scrolling to the next unanswered one.
   * @param questionIndex - Index of the skipped question.
   */
  const handleSkip = (questionIndex: number) => {
    if (!isSubmitted) {
      // Find the next unanswered question
      const nextUnansweredIndex = questions.findIndex((_, index) => !answers[index] && index > questionIndex);
      const nextQuestion = document.getElementById(`question-${nextUnansweredIndex}`);

      // Scroll to the next question if available
      if (nextQuestion) {
        nextQuestion.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Get the list of skipped questions
  const skippedQuestions = questions.filter((_, index) => !answers[index]);

  /**
   * Final submission handler. Calculates the score and stops the timer.
   */
  const handleFinalSubmit = () => {
    setShowReviewDialog(false); // Close the review modal

    setTimeout(() => {
      setIsSubmitted(true);

      // Calculate time taken
      if (startTimeRef.current) {
        const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTimeTaken(elapsedTime);
      }

      // Calculate score
      const correctCount = questions.reduce((acc, question, index) => {
        return acc + (answers[index] === question.answer ? 1 : 0);
      }, 0);
      setScore(correctCount);

      // Scroll to top after submission
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  /**
   * Handles submit button click. If there are skipped questions, show review modal.
   */
  const handleSubmit = () => {
    if (skippedQuestions.length > 0) {
      setShowReviewDialog(true);
    } else {
      handleFinalSubmit();
    }
  };

  /**
   * Prints the quiz results.
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Scrolls to the first skipped question when "Review Skipped" is clicked.
   */
  const handleReviewSkipped = () => {
    setShowReviewDialog(false);
    const firstSkippedIndex = questions.findIndex((_, index) => !answers[index]);

    if (firstSkippedIndex !== -1) {
      document.getElementById(`question-${firstSkippedIndex}`)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-12 px-6">
      {/* Quiz Title */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex-grow">
          {isSubmitted ? "Your Answers for Quiz" : "Quiz"}
        </h1>
        {isSubmitted && (
          <span className="text-lg font-medium text-gray-400 ml-auto">
            Time Taken: {timeTaken} sec
          </span>
        )}
      </div>

      {/* Quiz Questions */}
      <div className="w-full max-w-3xl space-y-6 overflow-y-auto" ref={containerRef}>
        {questions.map((question, questionIndex) => {
          const answerLabels = ["A", "B", "C", "D"];
          return (
            <Card
              key={questionIndex}
              id={`question-${questionIndex}`}
              className="bg-gray-800 shadow-md w-full p-6"
            >
              <CardHeader>
                <CardTitle className="text-lg">
                  {`Question ${questionIndex + 1} of ${questions.length}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {question.options.map((option, optionIndex) => {
                    const currentLabel = answerLabels[optionIndex];
                    const isCorrect = isSubmitted && currentLabel === question.answer;
                    const isSelected = answers[questionIndex] === currentLabel;
                    const isIncorrect = isSubmitted && isSelected && !isCorrect;

                    return (
                      <button
                        key={optionIndex}
                        className={`p-4 text-left w-full rounded-lg border transition
                          ${isSelected ? "border-blue-500 bg-blue-700" : "border-gray-700 bg-gray-800"}
                          ${isCorrect ? "border-green-500 bg-green-700" : ""}
                          ${isIncorrect ? "border-red-500 bg-red-700" : ""}
                        `}
                        onClick={() => handleSelectAnswer(questionIndex, currentLabel)}
                        disabled={isSubmitted}
                      >
                        {option}
                        {isCorrect && <Check className="ml-2 inline text-green-300" />}
                        {isIncorrect && <X className="ml-2 inline text-red-300" />}
                      </button>
                    );
                  })}
                </div>

                {/* "Don't Know" - Skip & Scroll */}
                {!isSubmitted && (
                  <p
                    className="text-center text-gray-400 mt-4 cursor-pointer hover:text-gray-200 transition"
                    onClick={() => handleSkip(questionIndex)}
                  >
                    Don&#39;t know?
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <Button onClick={handleSubmit} className="mt-6 bg-blue-600 hover:bg-blue-700">
          Submit Quiz
        </Button>
      )}

      {/* Show Score, Time Taken & Print Results */}
      {isSubmitted && (
        <div className="flex flex-col items-center mt-6 space-y-4">
          {/* Display Score */}
          <QuizScore correctAnswers={score} totalQuestions={questions.length} />

          {/* Time Taken */}
          <p className="text-lg text-gray-300">
            You completed the quiz in <span className="font-bold text-green-400">{timeTaken} sec</span>.
          </p>

          {/* Print Button */}
          <div className="flex gap-4">
            <Button onClick={handlePrint} variant="outline" className="flex items-center">
              <Printer className="w-4 h-4 mr-2" /> Print Results
            </Button>
          </div>
        </div>
      )}

      {/* Review Skipped Questions Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-gray-800 text-white p-6 rounded-lg">
          <DialogHeader className="flex flex-col items-center text-center">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
            <DialogTitle className="text-lg font-semibold mt-4">
              You have skipped {skippedQuestions.length} questions
            </DialogTitle>
          </DialogHeader>
          <div className="text-center text-gray-300">
            Do you want to go back and review them before submitting?
          </div>
          <div className="flex justify-center mt-4 space-x-4">
            <Button onClick={handleReviewSkipped} variant="outline">
              Review Skipped
            </Button>
            <Button onClick={handleFinalSubmit} className="bg-red-600 hover:bg-red-700">
              Submit Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
