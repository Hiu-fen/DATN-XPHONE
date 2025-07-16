
import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = "Bạn là Xphone, một trợ lý AI chuyên gia về điện thoại di động. Mục tiêu của bạn là cung cấp lời khuyên, câu trả lời hữu ích, chính xác và thân thiện cho bất kỳ câu hỏi nào về điện thoại thông minh. Điều này bao gồm thông số kỹ thuật, so sánh, đề xuất, khắc phục sự cố và tin tức mới nhất trong ngành di động. Hãy luôn trả lời bằng tiếng Việt.";

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
}
