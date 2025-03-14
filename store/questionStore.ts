import { create } from "zustand";
import { persist } from "zustand/middleware";

type QuizState = {
  title: string,
  pdfData: {files: any | null};
  questions: any[]; // Update with actual question type
  selectedLearningModel: string | null;
  setPdfData: (data: {files: any}) => void;
  setModelQuestions: (questions: any[]) => void;
  setSelectedLearningModel: (model: string) => void;
  setTitle: (title: string) => void;
};

export const useQuestionStore = create<QuizState>()(
  persist(
    (set) => ({
      title: "",
      pdfData: {files: null},
      questions: [],
      selectedLearningModel: null,
      setPdfData: (data: {files: any}) => set({ pdfData: data }),
      setSelectedLearningModel: (model) => set({selectedLearningModel:model }),
      setModelQuestions: (questions) => set({ questions }),
      setTitle: (title: string) => set({ title }),
    }),
    {
      name: "question-storage",
    }
  )
);
