import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateSummaryAndKeywords(text: string) {
  const trimmed = text.trim().slice(0, 12000);

  if (!trimmed) {
    return { summary: "", keywords: [] as string[] };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
Return ONLY valid JSON in this exact format:
{
  "summary": "3-5 lines summary",
  "keywords": ["tag1","tag2","tag3","tag4","tag5"]
}

Document text:
${trimmed}
  `.trim();

  const result = await model.generateContent(prompt);
  const output = result.response.text();

  const match = output.match(/\{[\s\S]*\}/); // grab first JSON object
  if (!match) return { summary: "", keywords: [] };

  try {
    const parsed = JSON.parse(match[0]);
    return {
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      keywords: Array.isArray(parsed.keywords)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? parsed.keywords.filter((x: any) => typeof x === "string")
        : [],
    };
  } catch {
    return { summary: "", keywords: [] };
  }
}
