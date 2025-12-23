
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Chapter, MockTest } from '../types';

// Performance Analysis type for Gemini JSON output
export interface PerformanceAnalysis {
  persona: string;
  accuracy: number;
  speedRating: string;
  subjectInsights: string;
  recommendations: string[];
}

/**
 * GEMINI API STUDY PLANNER
 * Uses gemini-3-pro-preview for complex reasoning tasks.
 */
export const generateStudyPlan = async (chapters: Chapter[], weakAreas: string[], intensity: string = 'high') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const lowConfidenceChapters = [...chapters]
    .filter(c => c.confidence < 70)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 10)
    .map(c => ({ name: c.name, subject: c.subject, confidence: c.confidence }));

  const prompt = `Act as an expert IIT JEE strategist. Generate a precise 7-day study plan for a student with these data points:
    - Current Low Confidence Units: ${JSON.stringify(lowConfidenceChapters)}
    - User Specified Weak Areas: ${weakAreas.join(', ')}
    - Daily Intensity: ${intensity} (low ~4h, medium ~8h, high ~12h)
    
    The output must be in Markdown format. Focus on balancing Physics, Chemistry, and Mathematics while prioritizing the weakest areas first.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 12000 }
      }
    });
    return response.text || "I was unable to formulate a strategy at this moment. Please review your metrics and try again.";
  } catch (error) {
    console.error("Gemini Strategy Error:", error);
    return "The logic engine is currently congested. Reverting to automated local scheduling...";
  }
};

/**
 * GEMINI AI MENTOR
 * Uses gemini-3-flash-preview for real-time natural conversations.
 */
export const getMentorAdvice = async (history: {role: string, content: string}[], message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...formattedHistory, { role: 'user', parts: [{ text: message }] }] as any,
      config: {
        systemInstruction: "You are an elite IIT JEE prep coach. Provide sharp, strategic, and subject-specific advice. Focus on Mechanics, Organic Chemistry, and Calculus as high-weightage areas. Be encouraging but rigorous.",
      }
    });
    return response.text || "I am currently processing high volumes of data. Please ask your strategy question again.";
  } catch (error) {
    console.error("Gemini Mentor Error:", error);
    return "Mentor session timed out. Please focus on your current chapter revision.";
  }
};

/**
 * GEMINI PERFORMANCE ANALYZER
 * Uses structured JSON output to analyze mock test data.
 */
export const analyzeMockPerformance = async (test: MockTest, chapters: Chapter[]): Promise<PerformanceAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this IIT JEE mock test session:
    - Scores: Physics ${test.physicsScore}, Chemistry ${test.chemistryScore}, Maths ${test.mathsScore}
    - Total: ${test.totalScore} / ${test.outOf}
    - Time used: ${test.timeTakenSeconds}s
    
    Current syllabus status for context:
    ${chapters.filter(c => c.confidence < 60).slice(0, 5).map(c => `${c.name} (${c.subject})`).join(', ')}
    
    Provide a psychological and technical performance breakdown in JSON format.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            persona: { type: Type.STRING, description: "A creative title for the student's exam persona" },
            accuracy: { type: Type.NUMBER, description: "Calculated accuracy percentage" },
            speedRating: { type: Type.STRING, description: "Velocity assessment (Optimal, Slow, or Rusher)" },
            subjectInsights: { type: Type.STRING, description: "Deep dive into subject-wise performance in Markdown" },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 clear actionable steps" }
          },
          required: ["persona", "accuracy", "speedRating", "subjectInsights", "recommendations"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      persona: parsed.persona || "The Persistent Aspirant",
      accuracy: parsed.accuracy || 0,
      speedRating: parsed.speedRating || "Average",
      subjectInsights: parsed.subjectInsights || "Insufficient data for detailed breakdown.",
      recommendations: parsed.recommendations || ["Review incorrect answers.", "Maintain consistency.", "Analyze time-per-question."]
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Return a basic structure if AI fails
    return {
      persona: "The Determined Student",
      accuracy: Math.round((test.totalScore / test.outOf) * 100),
      speedRating: (test.timeTakenSeconds || 0) < 5400 ? "High Velocity" : "Calculated",
      subjectInsights: "Deep AI analysis is currently unavailable. Review your subject scores to identify the primary focus for next week.",
      recommendations: ["Manually identify weak topics from the answer key.", "Increase focus on your lowest scoring subject.", "Attempt another mock test in 5 days."]
    };
  }
};
