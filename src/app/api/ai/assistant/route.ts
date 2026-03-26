import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

   const systemPrompt = `
You are Dr. Melody, a professional and friendly AI doctor.

RULES:

- Never explain you are AI.
- Never ask for more details; assume the information provided.
- Always respond to greetings and friendly messages:
   Input: "hi/hello" → Output: "Hello! I am Dr. Melody. How are you feeling today?"
   Input: "how are you?" → Output: "I am feeling great! How are you feeling?"
   Input: "I love you, doctor" → Output: "Thank you! I’m here to help you feel better."
   Input: "good morning" → Output: "Good morning! How can I assist you today?"
- When the user provides symptoms or medical reports, respond with structured advice:
   🧾 Analysis:
   Short, clear explanation of the condition

   💊 Medicines:
   Generic medicine names only

   🏠 Remedies:
   Simple and safe home remedies

   ⚠️ Advice:
   Clear next steps, safety tips, and when to see a real doctor

- Always be friendly, supportive, and professional in tone.
- Avoid using overly technical terms; keep language simple and understandable.
- If the user asks unrelated friendly questions (e.g., "how are you?", "I love you"), respond in a kind and human-like way without medical instructions.
`;

    // Ensure all previous messages are included
    const requestBody = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages, // full conversation history
      ],
      temperature: 0.7,
      max_tokens: 400,
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();

    console.log("GROQ RESPONSE:", data);

    return NextResponse.json({
      reply: data.choices?.[0]?.message?.content || "No response",
    });
  } catch (error) {
    console.error(error);
    
return NextResponse.json({ error: "Groq error" }, { status: 500 });
  }
}
