import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation } from "../types";

// Initialize the Gemini client
// Note: API_KEY is assumed to be available in process.env from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTravelRecommendations = async (origin: string): Promise<AIRecommendation[]> => {
  try {
    const model = 'gemini-2.5-flash';
    // Updated prompt to request response in Chinese
    const prompt = `推荐3个从${origin}出发的周末热门且实惠的旅游目的地。
    请以JSON格式返回响应，严格遵守以下Schema：
    对象数组，每个对象包含：
    - city (string): 目的地城市名称（中文）
    - reason (string): 一个非常简短的推荐理由，吸引人（最多10个字）
    - estimatedPrice (number): 预估最低机票价格，人民币（仅整数）
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              city: { type: Type.STRING },
              reason: { type: Type.STRING },
              estimatedPrice: { type: Type.INTEGER }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const data = JSON.parse(jsonText) as AIRecommendation[];
    return data;

  } catch (error) {
    console.error("Error fetching travel recommendations:", error);
    return [];
  }
};