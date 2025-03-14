"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, BookOpen, FileText, Grid, X } from "lucide-react";
import { LearningModel } from "@/lib/enum";
import { useQuestionStore } from "@/store/questionStore";
import { useRouter } from "next/navigation";
import FlashcardsPage from "@/components/flash-cards";
import QuizComponent from "@/components/quiz";
import { experimental_useObject } from "ai/react";
import { flashcardsSchema, questionsSchema } from "@/lib/schemas";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import Match from "@/components/match";

const modes = [
  { key: LearningModel.FLASHCARDS, label: "Flashcards", icon: <BookOpen className="w-4 h-4 mr-2" /> },
  { key: LearningModel.QUIZ, label: "Quiz", icon: <FileText className="w-4 h-4 mr-2" /> },
  { key: LearningModel.MATCH, label: "Match", icon: <Grid className="w-4 h-4 mr-2" /> },
];

export default function LearningModes() {
  const [mode, setMode] = useState(LearningModel.FLASHCARDS);
  const [isOpen, setIsOpen] = useState(false);
  const { pdfData, questions, setModelQuestions, title } = useQuestionStore();
  const router = useRouter();

  // Redirect if no data is available (prevents accessing page directly)
  if (!pdfData?.files) {
    router.push("/");
  }

  const {
    submit,
    object: partialQuestions,
    isLoading,
  } = experimental_useObject({
    api: mode === LearningModel.QUIZ ? "/api/generate-quiz" : "/api/generate-question-answer",
    schema: mode === LearningModel.QUIZ ? questionsSchema : flashcardsSchema,
    initialValue: undefined,
    onError: () => {
      toast.error("Failed to generate quiz. Please try again.");
    },
    onFinish: ({ object }) => {
      setModelQuestions(object ?? []);
    },
  });

  useEffect(() => {
    mode && pdfData.files && !isLoading && submit(pdfData);
  }, [mode, pdfData.files]);

  const progress = partialQuestions ? (partialQuestions.length / 8) * 100 : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-gray-900 text-white">
      {/* Page Title with Close Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-200">{title}</h1>
      </div>

      {/* Right-Aligned Close Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Dropdown Menu with Title */}
      <div className="absolute top-4 left-4 flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center px-4 py-2 bg-gray-800 shadow-md border border-gray-600 rounded-lg text-gray-200 font-medium hover:bg-gray-700 transition"
          >
            {modes.find((m) => m.key === mode)?.icon}
            {modes.find((m) => m.key === mode)?.label}
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>

          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 mt-2 w-40 shadow-lg rounded-lg overflow-hidden border bg-gray-800 text-white"
            >
              {modes.map((item) => (
                <li
                  key={item.key}
                  className={`flex items-center px-4 py-2 cursor-pointer transition 
                    ${mode === item.key ? "bg-gray-700 text-gray-300 font-semibold" : "text-gray-400"} 
                    hover:bg-gray-700`}
                  onClick={() => {
                    setMode(item.key);
                    setIsOpen(false);
                    setModelQuestions([]);
                  }}
                >
                  {item.icon} {item.label}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>

      {/* Loader with Progress Bar */}
      {isLoading ? (
        <div className="w-60 space-y-1">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="w-full space-y-2">
            <div className="grid grid-cols-6 sm:grid-cols-4 items-center space-x-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  isLoading ? "bg-yellow-500/50 animate-pulse" : "bg-muted"
                }`}
              />
              <span className="text-muted-foreground text-center col-span-4 sm:col-span-2">
                {partialQuestions
                  ? `Generating question ${partialQuestions.length + 1} of 8`
                  : "Analyzing...."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="w-full flex justify-center"
        >
          {mode === LearningModel.FLASHCARDS && <FlashcardsPage questions={questions} />}
          {mode === LearningModel.QUIZ && <QuizComponent questions={questions} />}
          {mode === LearningModel.MATCH && <Match questions={questions} />}
        </motion.div>
      )}
    </div>
  );
}
