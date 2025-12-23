
import { Chapter, MockTest } from '../types';

/**
 * DETERMINISTIC LOCAL STUDY PLANNER
 */
export const generateStudyPlan = async (chapters: Chapter[], weakAreas: string[], intensity: string = 'high') => {
  const lowConfidenceChapters = [...chapters]
    .filter(c => c.confidence < 70)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 10);

  const hoursPerDay = intensity === 'high' ? 12 : intensity === 'medium' ? 8 : 4;
  
  let plan = `# 7-Day Precision Roadmap (${intensity.toUpperCase()} INTENSITY)\n\n`;
  plan += `**Target:** Addressing your ${lowConfidenceChapters.length} most critical units and personal focus areas.\n\n`;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach((day, i) => {
    const focusChapter = lowConfidenceChapters[i % lowConfidenceChapters.length];
    const secondaryFocus = lowConfidenceChapters[(i + 1) % lowConfidenceChapters.length];
    
    plan += `### ${day}\n`;
    plan += `- **Primary Focus (${Math.floor(hoursPerDay * 0.6)}h):** ${focusChapter?.name || 'Full Syllabus Revision'}\n`;
    plan += `- **Problem Solving (${Math.floor(hoursPerDay * 0.3)}h):** Practice questions for ${secondaryFocus?.name || 'General Inventory'}\n`;
    if (weakAreas.length > 0 && weakAreas[0] !== "") {
      plan += `- **Personal Goal:** Deep dive into ${weakAreas[i % weakAreas.length]}\n`;
    }
    plan += `- **Review:** 1 hour formula check for all ${focusChapter?.subject} units.\n\n`;
  });

  return plan;
};

/**
 * LOCAL MENTOR LOGIC
 */
export const getMentorAdvice = async (history: {role: string, content: string}[], message: string) => {
  const msg = message.toLowerCase();
  const responses = [
    { key: 'physics', text: "For Physics, prioritize Mechanics and Electrodynamics. Always draw free-body diagrams before writing equations." },
    { key: 'chemistry', text: "In Organic Chemistry, focus on reaction mechanisms (GOC). For Inorganic, NCERT is your bible—memorize the trends." },
    { key: 'math', text: "Calculus and Coordinate Geometry carry the most weight. Practice at least 20 PYQs daily to build speed." },
    { key: 'test', text: "Mock tests are for strategy, not just marks. Analyze your 'silly mistakes'—they are usually caused by bad time management." },
    { key: 'revision', text: "The best revision is re-solving questions you got wrong the first time. Keep a separate 'Error Notebook'." },
    { key: 'time', text: "Use the Pomodoro technique: 50 mins study, 10 mins break. This keeps your brain fresh for the 3-hour exam duration." }
  ];
  const matched = responses.find(r => msg.includes(r.key));
  return matched ? matched.text : "I'm here to help with your JEE strategy. Ask me about subject tips or revision.";
};

/**
 * LOCAL PERFORMANCE ANALYZER (ENHANCED)
 */
export interface PerformanceAnalysis {
  persona: string;
  accuracy: number;
  speedRating: string;
  subjectInsights: string;
  recommendations: string[];
}

export const analyzeMockPerformance = async (test: MockTest, chapters: Chapter[]): Promise<PerformanceAnalysis> => {
  const accuracy = Math.round((test.totalScore / test.outOf) * 100);
  
  // Calculate Speed Metrics (Assuming 180 min total for full tests)
  const timeTakenMin = (test.timeTakenSeconds || 0) / 60;
  const totalDurationMin = 180; 
  const timeUsedPercent = (timeTakenMin / totalDurationMin) * 100;
  
  let persona = "The Calculated Strategist";
  let speedRating = "Optimal";

  if (timeUsedPercent < 40 && accuracy < 50) {
    persona = "The Rusher";
    speedRating = "Excessive (Sacrificing Accuracy)";
  } else if (timeUsedPercent > 90 && accuracy < 60) {
    persona = "The Struggler";
    speedRating = "Slow (Conceptual Gaps Detected)";
  } else if (timeUsedPercent > 80 && accuracy > 85) {
    persona = "The Perfectionist";
    speedRating = "Methodical (High Precision)";
  } else if (timeUsedPercent < 70 && accuracy > 85) {
    persona = "The JEE Topper Prototype";
    speedRating = "Elite (Fast & Precise)";
  }

  // Identify Weakest Subject
  const scores = [
    { name: 'Physics', val: test.physicsScore },
    { name: 'Chemistry', val: test.chemistryScore },
    { name: 'Mathematics', val: test.mathsScore }
  ].sort((a, b) => a.val - b.val);
  
  const weakest = scores[0];
  const relevantChapters = chapters
    .filter(c => c.subject === weakest.name && c.confidence < 60)
    .slice(0, 2);

  const insights = `Your performance in **${weakest.name}** (${weakest.val} marks) is the primary anchor holding back your rank. Your speed is **${speedRating}**.`;

  const recs = [
    `Switch focus to ${weakest.name} for the next 48 hours.`,
    relevantChapters.length > 0 
      ? `Re-watch lectures for ${relevantChapters.map(c => c.name).join(' and ')}.` 
      : `Increase numerical practice density in ${weakest.name}.`,
    accuracy < 70 ? "Reduce 'guess-work' to avoid heavy negative marking penalties." : "Maintain accuracy but work on reducing time-per-question by 15 seconds."
  ];

  return {
    persona,
    accuracy,
    speedRating,
    subjectInsights: insights,
    recommendations: recs
  };
};
