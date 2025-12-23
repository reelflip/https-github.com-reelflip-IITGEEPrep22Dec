
import { GoogleGenAI } from "@google/genai";
import { Chapter, MockTest } from '../types';
import MockDB from './mockDb';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple TTL Cache for 5 minutes
const cache = new Map<string, { data: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

const getCached = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  return null;
};

const setCached = (key: string, data: string) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Utility to get the active model configured by Admin
const getActiveModelId = () => {
  const config = MockDB.config.get();
  // Mapping of UI Friendly IDs to actual Google GenAI model names
  const modelMap: Record<string, string> = {
    'gemini-3-flash': 'gemini-3-flash-preview',
    'gemini-3-pro': 'gemini-3-pro-preview',
    'llama-3-1': 'gemini-3-flash-preview', // Proxying non-native models to Flash for logic
    'deepseek-v3': 'gemini-3-pro-preview',
    'qwen-math': 'gemini-3-pro-preview',
    'mistral-large': 'gemini-3-pro-preview'
  };
  return modelMap[config.activeModelId] || 'gemini-3-flash-preview';
};

export const generateStudyPlan = async (chapters: Chapter[], weakAreas: string[], intensity: string = 'high') => {
  const modelName = getActiveModelId();
  const cacheKey = `plan_${modelName}_${JSON.stringify(weakAreas)}_${chapters.length}_${intensity}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const prompt = `
    Context: IIT JEE 2025 Preparation.
    Status: ${JSON.stringify(chapters.filter(c => c.confidence < 60).map(c => ({ name: c.name, conf: c.confidence })))}
    Weakness: ${weakAreas.join(', ')}
    Intensity: ${intensity.toUpperCase()} (Low: 4h/day, Medium: 8h/day, High: 12h+/day)
    Task: Create a 7-day personalized study plan based on this intensity. Use Markdown formatting. Focus heavily on weak areas.
  `;

  try {
    const response = await ai.models.generateContent({ model: modelName, contents: prompt });
    setCached(cacheKey, response.text);
    return response.text;
  } catch (error) {
    return "The AI Planning Engine is experiencing heavy traffic. Using last cached strategy.";
  }
};

export const getMentorAdvice = async (history: {role: string, content: string}[], message: string) => {
  const modelName = getActiveModelId();
  const contents = [
    { role: 'user', parts: [{ text: "You are an IIT JEE Master Mentor. Keep advice brief." }] },
    ...history.map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await ai.models.generateContent({ model: modelName, contents: contents });
    return response.text;
  } catch (error) {
    return "Network interference detected. Focus on your basics while I reconnect.";
  }
};

export const analyzeMockPerformance = async (test: MockTest, chapters: Chapter[]) => {
  const modelName = getActiveModelId();
  const prompt = `Analyze JEE Mock: ${test.totalScore}/300. PHY:${test.physicsScore}, CHE:${test.chemistryScore}, MAT:${test.mathsScore}. Concisely suggest 2-3 weak chapters to focus on.`;

  try {
    const response = await ai.models.generateContent({ model: modelName, contents: prompt });
    return response.text;
  } catch (error) {
    return "Analysis service temporarily delayed.";
  }
};
