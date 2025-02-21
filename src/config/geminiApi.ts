import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getAnswer(question: string, student: string) {
  const prePrompt = `You are a Tutor and you are chatting with a student ${student}, the student is asking you a question: ${question}. answer in short `;
  const result = await model.generateContent(prePrompt + " " + question);
  return result.response.text();
}
