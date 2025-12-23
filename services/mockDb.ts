
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
   */
  private static async apiFetch(endpoint: string, options: any = {}) {
    // In a real Laravel deployment, this would be the API route prefix
    const baseUrl = '/api'; 
    try {
      const response = await fetch(`${baseUrl}/${endpoint}`, {
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
      throw new Error("Unable to connect to MySQL backend. Ensure XAMPP is active.");
    }
  }

  /**
   * MOCK STORAGE ENGINE
   */
  private static getDB() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return this.seedDB();
    const db = JSON.parse(data);
    if (db.version !== this.SCHEMA_VERSION) return this.migrate(db);
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

  private static migrate(oldDb: any) {
    const migrated = { ...oldDb, version: this.SCHEMA_VERSION };
    this.saveDB(migrated);
    return migrated;
  }

  private static saveDB(data: any) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * AUTHENTICATION & IDENTITY
   */
  static auth = {
    user: (): User | null => MockDB.getDB().currentUser,
    login: async (email: string, pass: string): Promise<User | string> => {
      if (MockDB.isLiveMode()) {
        try {
          const res = await MockDB.apiFetch('login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
          const db = MockDB.getDB();
          db.currentUser = res.user;
          MockDB.saveDB(db);
          return res.user;
        } catch (e: any) { return e.message; }
      }
      const db = MockDB.getDB();
      const user = db.users.find((u: User) => u.email === email && u.password === pass);
      if (user) {
        if (user.status === 'blocked') return "Account access restricted by system administrator.";
        db.currentUser = user;
        MockDB.saveDB(db);
        return user;
      }
      return "Invalid email or security password.";
    },
    register: async (name: string, email: string, pass: string, hint: string): Promise<User | string> => {
      if (MockDB.isLiveMode()) {
        try {
          return await MockDB.apiFetch('register', { method: 'POST', body: JSON.stringify({ name, email, password: pass, recoveryHint: hint }) });
        } catch (e: any) { return e.message; }
      }
      const db = MockDB.getDB();
      if (db.users.find((u: User) => u.email === email)) return "Identity already registered.";
      const newUser: User = { id: `u_${Date.now()}`, name, email, password: pass, role: 'student', joined: new Date().toISOString(), status: 'active', recoveryHint: hint };
      db.users.push(newUser);
      const userChapters = db.globalChapters.map((c: any) => ({ ...c, id: `${newUser.id}_${c.id}`, userId: newUser.id, questions: [] }));
      db.userChapters = [...(db.userChapters || []), ...userChapters];
      db.currentUser = newUser;
      MockDB.saveDB(db);
      return newUser;
    },
    recover: async (email: string, hint: string, newPass: string): Promise<string> => {
      if (MockDB.isLiveMode()) {
        const res = await MockDB.apiFetch('recover', { method: 'POST', body: JSON.stringify({ email, recoveryHint: hint, newPassword: newPass }) });
        return res.success ? "SUCCESS" : res.error;
      }
      const db = MockDB.getDB();
      const user = db.users.find((u: User) => u.email === email);
      if (!user || user.recoveryHint !== hint) return "Security verification failed.";
      user.password = newPass;
      MockDB.saveDB(db);
      return "SUCCESS";
    },
    logout: () => {
      const db = MockDB.getDB();
      db.currentUser = null;
      MockDB.saveDB(db);
    }
  };

  /**
   * CURRICULUM & PROGRESS
   */
  static chapters = {
    all: async (): Promise<Chapter[]> => {
      if (MockDB.isLiveMode()) {
        const userId = MockDB.auth.user()?.id;
        return await MockDB.apiFetch(`chapters?userId=${userId}`);
      }
      const db = MockDB.getDB();
      const user = db.currentUser;
      if (!user) return [];
      return user.role === 'admin' ? db.globalChapters : db.userChapters.filter((c: Chapter) => c.userId === user.id);
    },
    update: async (id: string, updates: Partial<Chapter>): Promise<Chapter> => {
      if (MockDB.isLiveMode()) {
        return await MockDB.apiFetch(`chapters/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      }
      const db = MockDB.getDB();
      const user = db.currentUser;
      const key = user?.role === 'admin' ? 'globalChapters' : 'userChapters';
      db[key] = db[key].map((c: Chapter) => c.id === id ? { ...c, ...updates } : c);
      MockDB.saveDB(db);
      return db[key].find((c: Chapter) => c.id === id);
    }
  };

  /**
   * QUESTION REPOSITORY
   */
  static questions = {
    all: async (): Promise<Question[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('questions');
      return MockDB.getDB().globalQuestions || [];
    },
    add: async (q: Omit<Question, 'id'>): Promise<Question> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('questions', { method: 'POST', body: JSON.stringify(q) });
      const db = MockDB.getDB();
      const newQ = { ...q, id: `q_${Date.now()}` };
      db.globalQuestions.push(newQ);
      MockDB.saveDB(db);
      return newQ;
    },
    delete: async (id: string): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch(`questions/${id}`, { method: 'DELETE' });
      const db = MockDB.getDB();
      db.globalQuestions = db.globalQuestions.filter((q: Question) => q.id !== id);
      MockDB.saveDB(db);
    }
  };

  /**
   * TEST ENGINE
   */
  static tests = {
    all: async (): Promise<MockTest[]> => {
      if (MockDB.isLiveMode()) {
        const userId = MockDB.auth.user()?.id;
        return await MockDB.apiFetch(`tests?userId=${userId}`);
      }
      return MockDB.getDB().tests.filter((t: MockTest) => t.userId === MockDB.getDB().currentUser?.id);
    },
    getMasterMocks: async (): Promise<MasterMockTest[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('master-mocks');
      return MockDB.getDB().masterMocks;
    },
    addMasterMock: async (mock: MasterMockTest): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('master-mocks', { method: 'POST', body: JSON.stringify(mock) });
      const db = MockDB.getDB();
      db.masterMocks.push(mock);
      MockDB.saveDB(db);
    },
    deleteMasterMock: async (id: string): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch(`master-mocks/${id}`, { method: 'DELETE' });
      const db = MockDB.getDB();
      db.masterMocks = db.masterMocks.filter((m: MasterMockTest) => m.id !== id);
      MockDB.saveDB(db);
    },
    create: async (test: MockTest): Promise<MockTest> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('tests', { method: 'POST', body: JSON.stringify(test) });
      const db = MockDB.getDB();
      const newTest = { ...test, userId: db.currentUser?.id };
      db.tests.unshift(newTest);
      MockDB.saveDB(db);
      return newTest;
    },
    delete: async (id: string): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch(`tests/${id}`, { method: 'DELETE' });
      const db = MockDB.getDB();
      db.tests = db.tests.filter((t: MockTest) => t.id !== id);
      MockDB.saveDB(db);
    }
  };

  /**
   * ADMIN & SYSTEM OPERATIONS
   */
  static admin = {
    getAllUsers: async (): Promise<User[]> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('users');
      return MockDB.getDB().users;
    },
    addUser: async (user: Omit<User, 'id' | 'joined' | 'status'>): Promise<User> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch('users', { method: 'POST', body: JSON.stringify(user) });
      const db = MockDB.getDB();
      const newUser: User = { ...user, id: `u_${Date.now()}`, joined: new Date().toISOString(), status: 'active' };
      db.users.push(newUser);
      MockDB.saveDB(db);
      return newUser;
    },
    updateUser: async (id: string, updates: Partial<User>): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch(`users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
      const db = MockDB.getDB();
      db.users = db.users.map((u: User) => u.id === id ? { ...u, ...updates } : u);
      MockDB.saveDB(db);
    },
    deleteUser: async (id: string): Promise<void> => {
      if (MockDB.isLiveMode()) return await MockDB.apiFetch(`users/${id}`, { method: 'DELETE' });
      const db = MockDB.getDB();
      db.users = db.users.filter((u: User) => u.id !== id);
      MockDB.saveDB(db);
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
        mode: MockDB.isLiveMode() ? 'LIVE' : 'MOCK'
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
