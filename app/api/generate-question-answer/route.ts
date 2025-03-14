import { flashcardSchema, flashcardsSchema } from "@/lib/schemas";
import { google } from "@ai-sdk/google";
import { streamObject } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = streamObject({
    model: google("gemini-2.0-flash"),
    messages: [
      {
        role: "system",
        content:
          "You are a teacher. Your job is to take a document and create a set of fill-in-the-blank (with 8 questions) flashcards based on its content. Each flashcard should have a sentence with a missing word (blank) as the question and the correct word/phrase as the answer.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Create fill-in-the-blank flashcards from this document.",
          },
          {
            type: "file",
            data: firstFile,
            mimeType: "application/pdf",
          },
        ],
      },
    ],
    schema: flashcardSchema,
    output: "array",
    onFinish: ({ object }) => {
      const res = flashcardsSchema.safeParse(object);

      console.log(res.error, "hh");
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join("\n"));
      }
    },
  });

  return result.toTextStreamResponse();
}

