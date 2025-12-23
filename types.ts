
export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';
export type UserRole = 'admin' | 'student';

export enum ChapterStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  REVISION_NEEDED = 'Revision Needed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  recoveryHint?: string; // For password recovery simulation
  role: UserRole;
  joined: string;
}

export interface SystemLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface VideoLink {
  id: string;
  title: string;
  url: string;
  durationInMinutes?: number;
}

export interface Question {
  id: string;
  subject: Subject;
  chapterId?: string; // Optional for untagged
  examTag?: string; // New: To tag previous IIT JEE exams (e.g. "JEE Main 2024")
  text: string;
  options: string[];
  correctAnswer: number; // 0-3
}

export interface TestAttempt {
  id: string;
  date: string;
  score: number;
  total: number;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string; // New: For admin-provided short summary
  userId?: string; 
  subject: Subject;
  status: ChapterStatus;
  confidence: number;
  lastRevised?: string;
  notes?: string;
  videoLinks: VideoLink[];
  questions: Question[];
  attempts: TestAttempt[];
  timeSpentMinutes: number;
  videosWatchedMinutes: number;
  questionsSolvedCount: number;
}

export interface MasterMockTest {
  id: string;
  name: string;
  durationMinutes: number;
  totalMarks: number;
  questionIds: string[]; 
}

export interface MockTest {
  id: string;
  userId: string;
  name: string;
  date: string;
  physicsScore: number;
  chemistryScore: number;
  mathsScore: number;
  totalScore: number;
  outOf: number;
  isAutomated?: boolean; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  tag: string;
  description: string;
  type: 'speed' | 'reasoning' | 'math' | 'logic' | 'balanced' | 'general';
  internalId: string;
}

export interface ModelMetric {
  date: string;
  accuracy: number;
  latency: number;
}
