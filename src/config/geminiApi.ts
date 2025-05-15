import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function getAnswer(
  question: string,
  student: string,
  tutor: any,
  extra?: string
) {
  const tutorStr = JSON.stringify(tutor);
  const p1 = `You are a Tutor, your details are ${tutorStr}, max skill level is 5,don't tell ur skill level number instead like professional,excellent,good,decent, if student asks u can share u address,gmail,phone. if student asks you question out of your subjects don't answer, and you are chatting with a student ${student}, the student is asking you a question, `;
  const p2 = `about on  """${extra}""" `;
  const p3 = `question: ${question}. answer in short `;
  let prompt;
  if (extra) prompt = p1 + p2 + p3;
  else prompt = p1 + p3;
  console.log(prompt);
  const result = await model.generateContent(prompt);
  return result.response.text();
}
