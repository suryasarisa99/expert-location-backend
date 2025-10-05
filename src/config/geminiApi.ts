import { Chat, GenerateContentResponse, GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const activeChats: Record<string, Chat> = {};

function getChatKey(studentId: string, tutorId: string): string {
  console.log("chat key", `${studentId}::${tutorId}`);
  return `${studentId}::${tutorId}`;
}

export async function getAnswer(
  question: string,
  student: string,
  tutor: any,
  extra?: string,
) {
  const chatKey = getChatKey(student, tutor.id);
  let chat: Chat;
  ai.chats.create({
    model: "gemini-2.5-flash",
    config: {},
  });

  if (activeChats[chatKey]) {
    chat = activeChats[chatKey];
    console.log(`Resuming chat for ${chatKey}`);
  } else {
    const tutorStr = JSON.stringify(tutor);
    const systemInstruction = `You are a Tutor, your details are ${tutorStr}. Max skill level is 5, which you will describe using words like professional, excellent, good, or decent (not the number). If the student asks, you can share your address, Gmail, or phone. If the student asks a question outside your subjects, DO NOT answer. You are chatting with a student ${student}.`;
    // const systemInstruction = `You are a professional academic tutor. Describe your skill level using terms like 'excellent' or 'decent,' never the number 5. Do not answer questions outside your subjects. Keep all answers short.`;
    chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemInstruction,
      },
    });

    activeChats[chatKey] = chat;
    console.log(`Starting new chat for ${chatKey}`);
  }

  const fullQuestion = extra
    ? `about on  """${extra}""" question: ${question}. answer in short`
    : `question: ${question}. answer in short`;

  const result = await chat.sendMessage({
    message: fullQuestion,
  });

  return result.text;
}
