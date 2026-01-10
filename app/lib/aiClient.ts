import { Message } from "@/app/types";
import { buildSystemPrompt } from "@/app/utils/utils";

async function askOpenAI(messages: Message[]) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: messages,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    reply: data.output_text,
    model: "OpenAI GPT-4.1-Mini",
  };
}

async function askGemini(text: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
      }),
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    reply:
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.",
    model: "Gemini 2.0 Flash",
  };
}

async function askGroq(messages: Message[]) {
  const clean = messages.map(({ role, content }) => ({ role, content }));

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: clean,
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    reply: data.choices?.[0]?.message?.content,
    model: "Groq Llama-3.3-70B",
  };
}

export async function askAI(
  conversation: Message[],
  lastUserText: string,
  role: string
) {
  const safeRole =
    role ||
    `You are an expert technical interviewer and mentor with deep experience across frontend, backend, DevOps, QA, system design, and software architecture. You are currently helping a candidate prepare for interview. Your task is to help developers prepare for interviews by giving clear, structured, and practical answers`;
  const systemPrompt = buildSystemPrompt(safeRole);

  try {
    return await askOpenAI([systemPrompt, ...conversation]);
  } catch {}

  try {
    return await askGemini(lastUserText);
  } catch {}

  try {
    return await askGroq([systemPrompt, ...conversation]);
  } catch {}

  return {
    reply: "AI services are currently unavailable.",
    model: "Unavailable",
  };
}
