
import { Chapter, MockTest, User, UserRole, MasterMockTest, SystemLog, Question } from '../types';
import { INITIAL_CHAPTERS } from '../constants';

class MockDB {
  private static STORAGE_KEY = 'jee_mastery_db_v10_integrated';
  private static MODE_KEY = 'jee_mastery_data_mode';
  private static SCHEMA_VERSION = '1.6';

  /**
   * GLOBAL MODE CONTROL
   */
  static isLiveMode(): boolean {
    return localStorage.getItem(this.MODE_KEY) === 'live';
  }

  static setLiveMode(isLive: boolean) {
    localStorage.setItem(this.MODE_KEY, isLive ? 'live' : 'mock');
  }

  /**
   * API BRIDGE UTILITY
   * Targets the api.php endpoint provided in the root.
   */
  private static async apiFetch(endpoint: string, options: any = {}) {
    // Relative path for XAMPP deployment
    const baseUrl = '/api.php?route='; 
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server Error: ${response.statusText}`);
      }
      return await response.json();
    } catch (e: any) {
      console.error("Critical: Live Database Connectivity Failure:", e);
      throw new Error("Unable to connect to MySQL backend. Ensure XAMPP and MySQL are active.");
    }
  }

  /**
   * MOCK STORAGE ENGINE (LOCAL)
   */
  private static getDB() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return this.seedDB();
    const db = JSON.parse(data);
    return db;
  }

  private static seedDB() {
    const adminUser: User = { id: 'admin_1', name: 'Super Admin', email: 'admin@mastery.com', password: 'admin', role: 'admin', joined: new Date().toISOString(), status: 'active' };
    const demoStudent: User = { id: 'student_demo', name: 'Demo Student', email: 'student@demo.com', password: 'password', role: 'student', joined: new Date().toISOString(), status: 'active' };
    const globalChapters = INITIAL_CHAPTERS.map(c => ({ ...c }));
    const globalQuestions: Question[] = globalChapters.flatMap(c => c.questions.map(q => ({ ...q, chapterId: c.id })));
    const initial = {
      version: this.SCHEMA_VERSION,
      users: [adminUser, demoStudent],
      globalChapters,
      globalQuestions,
      userChapters: globalChapters.map(c => ({ ...c, id: `student_demo_${c.id}`, userId: 'student_demo', questions: [] })),
      tests: [],
      logs: [{ id: 'L1', userId: 'system', userName: 'System', action: 'Mock DB Initialized', timestamp: new Date().toISOString(), level: 'info' }],
      masterMocks: [{ id: 'mock_1', name: 'JEE Main Phase 1 Full Syllabus', durationMinutes: 180, totalMarks: 300, questionIds: globalQuestions.slice(0, 5).map(q => q.id) }],
      systemConfig: { defaultIntensity: 'medium', modelMetrics: [] },
      currentUser: null
    };
    this.saveDB(initial);
    return initial;
  }

  private static saveDB(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * AUTHENTICATION
   */
  static auth = {
    user: (): User | null => MockDB.getDB().currentUser,
    login: async (email: string, pass: string): Promise<User | string> => {
      if (MockDB.isLiveMode()) {
        try {
          const res = await MockDB.apiFetch('login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
          // Update local "current user" session cache
          const db = MockDB.getDB();
          db.currentUser = res.user;
          MockDB.saveDB(db);
          return res.user;
        } catch (e: any) { return e.message; }
      }
      // Local Fallback
      const db = MockDB.getDB();
      const user = db.users.find((u: User) => u.email === email && u.password === pass);
      if (user) {
        db.currentUser = user;
        MockDB.saveDB(db);
        return user;
      }
      return "Invalid credentials.";
    },
    register: async (name: string, email: string, pass: string, hint: string): Promise<User | string> => {
      if (MockDB.isLiveMode()) {
        return await MockDB.apiFetch('register', { method: 'POST', body: JSON.stringify({ name, email, password: pass, recoveryHint: hint }) });
      }
      const db = MockDB.getDB();
      const newUser: User = { id: `u_${Date.now()}`, name, email, password: pass, role: 'student', joined: new Date().toISOString(), status: 'active', recoveryHint: hint };
      db.users.push(newUser);
      db.currentUser = newUser;
      MockDB.saveDB(db);
      return newUser;
    },
    // Fix: Added missing recover method to MockDB.auth
    recover: async (email: string, hint: string, newPass: string): Promise<string> => {
      if (MockDB.isLiveMode()) {
        try {
          const res = await MockDB.apiFetch('recover', { method: 'POST', body: JSON.stringify({ email, recoveryHint: hint, newPassword: newPass }) });
          return res.success ? "SUCCESS" : (res.error || "Recovery failed.");
        } catch (e: any) { return e.message; }
      }
      const db = MockDB.getDB();
      const user = db.users.find((u: User) => u.email === email && u.recoveryHint === hint);
      if (user) {
        user.password = newPass;
        MockDB.saveDB(db);
        return "SUCCESS";
      }
      return "Invalid email or recovery key.";
    },
    logout: () => {
      const db = MockDB.getDB();
      db.currentUser = null;
      MockDB.saveDB(db);
    }
  };

  /**
   * DATA ACCESSORS
   */
  static chapters = {
    all: async (): Promise<Chapter[]> => {
      if (MockDB.isLiveMode()) {
        const user = MockDB.auth.user();
        return await MockDB.apiFetch(`getChapters&userId=${user?.id}`);
      }
      const db = MockDB.getDB();
      const user = db.currentUser;
      return user?.role === 'admin' ? db.globalChapters : db.userChapters.filter((c: Chapter) => c.userId === user?.id);
    },
    update: async (id: string, updates: Partial<Chapter>): Promise<Chapter> => {
      if (MockDB.isLiveMode()) {
        return await MockDB.apiFetch(`updateChapter`, { method: 'POST', body: JSON.stringify({ id, ...updates }) });
      }
      const db = MockDB.getDB();
      const key = db.currentUser?.role === 'admin' ? 'globalChapters' : 'userChapters';
      db[key] = db[key].map((c: Chapter) => c.id === id ? { ...c, ...updates } : c);
      MockDB.saveDB(db);
      return db[key].find((c: Chapter) => c.id === id);
    }
  };

  static questions = {
    all: async (): Promise<Question[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('getQuestions');
      return MockDB.getDB().globalQuestions || [];
    },
    add: async (q: Omit<Question, 'id'>): Promise<Question> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('addQuestion', { method: 'POST', body: JSON.stringify(q) });
      const db = MockDB.getDB();
      const newQ = { ...q, id: `q_${Date.now()}` };
      db.globalQuestions.push(newQ);
      MockDB.saveDB(db);
      return newQ;
    }
  };

  static tests = {
    all: async (): Promise<MockTest[]> => {
      if (MockDB.isLiveMode()) {
        const user = MockDB.auth.user();
        return await MockDB.apiFetch(`getTests&userId=${user?.id}`);
      }
      return MockDB.getDB().tests.filter((t: MockTest) => t.userId === MockDB.getDB().currentUser?.id);
    },
    getMasterMocks: async (): Promise<MasterMockTest[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('getMasterMocks');
      return MockDB.getDB().masterMocks;
    },
    create: async (test: MockTest): Promise<MockTest> => {
      if (MockDB.isLiveMode()) {
        const user = MockDB.auth.user();
        return await MockDB.apiFetch('addTest', { method: 'POST', body: JSON.stringify({ ...test, userId: user?.id }) });
      }
      const db = MockDB.getDB();
      db.tests.unshift({ ...test, userId: db.currentUser?.id });
      MockDB.saveDB(db);
      return test;
    },
    // Fix: Added missing delete method to MockDB.tests
    delete: async (id: string): Promise<boolean> => {
      if (MockDB.isLiveMode()) {
        await MockDB.apiFetch('deleteTest', { method: 'POST', body: JSON.stringify({ id }) });
        return true;
      }
      const db = MockDB.getDB();
      db.tests = db.tests.filter((t: MockTest) => t.id !== id);
      MockDB.saveDB(db);
      return true;
    }
  };

  static admin = {
    getAllUsers: async (): Promise<User[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('getUsers');
      return MockDB.getDB().users;
    },
    getLogs: () => MockDB.getDB().logs,
    getSystemStats: () => {
      const db = MockDB.getDB();
      return {
        totalStudents: db.users.filter((u: User) => u.role === 'student').length,
        totalQuestions: db.globalQuestions.length,
        totalTestsTaken: db.tests.length,
        dbSize: (JSON.stringify(db).length / 1024).toFixed(2) + ' KB',
        version: db.version,
        mode: MockDB.isLiveMode() ? 'LIVE PRODUCTION' : 'LOCAL MOCK'
      };
    }
  };

  static config = {
    get: () => MockDB.getDB().systemConfig,
    set: (config: any) => {
      const db = MockDB.getDB();
      db.systemConfig = { ...db.systemConfig, ...config };
      MockDB.saveDB(db);
    }
  };
}

export default MockDB;
