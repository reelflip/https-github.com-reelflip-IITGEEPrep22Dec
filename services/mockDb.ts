
import { Chapter, MockTest, User, UserRole, MasterMockTest, SystemLog, Question, AIModelConfig } from '../types';
import { INITIAL_CHAPTERS } from '../constants';

class MockDB {
  private static STORAGE_KEY = 'jee_mastery_db_v8_ai_config';
  private static SCHEMA_VERSION = '1.4';

  private static getDB() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return this.seedDB();
    }
    const db = JSON.parse(data);
    if (db.version !== this.SCHEMA_VERSION) {
      return this.migrate(db);
    }
    return db;
  }

  private static seedDB() {
    const adminUser: User = {
      id: 'admin_1',
      name: 'Super Admin',
      email: 'admin@mastery.com',
      password: 'admin',
      recoveryHint: 'system_root',
      role: 'admin',
      joined: new Date().toISOString(),
      status: 'active'
    };

    const demoStudent: User = {
      id: 'student_demo',
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'password',
      recoveryHint: 'demo',
      role: 'student',
      joined: new Date().toISOString(),
      status: 'active'
    };

    const globalChapters = INITIAL_CHAPTERS.map(c => ({ ...c }));
    const globalQuestions: Question[] = globalChapters.flatMap(c => 
      c.questions.map(q => ({ ...q, chapterId: c.id }))
    );

    const initial = {
      version: this.SCHEMA_VERSION,
      users: [adminUser, demoStudent],
      globalChapters: globalChapters,
      globalQuestions: globalQuestions,
      userChapters: globalChapters.map(c => ({
        ...c,
        id: `student_demo_${c.id}`,
        userId: 'student_demo',
        questions: [] 
      })),
      tests: [],
      logs: [{
        id: 'L1',
        userId: 'system',
        userName: 'System',
        action: 'Database Initialized and Seeded',
        timestamp: new Date().toISOString(),
        level: 'info'
      }],
      masterMocks: [
        {
          id: 'mock_1',
          name: 'JEE Main Full Syllabus Mock #1',
          durationMinutes: 180,
          totalMarks: 300,
          questionIds: globalQuestions.slice(0, 10).map(q => q.id)
        }
      ],
      systemConfig: {
        activeModelId: 'gemini-3-flash',
        modelMetrics: [
          { date: '01/05', accuracy: 88, latency: 1.2 },
          { date: '02/05', accuracy: 89, latency: 1.1 },
          { date: '03/05', accuracy: 87, latency: 1.4 },
          { date: '04/05', accuracy: 91, latency: 0.9 },
          { date: '05/05', accuracy: 92, latency: 0.8 },
        ]
      },
      currentUser: null
    };
    this.saveDB(initial);
    return initial;
  }

  private static migrate(oldDb: any) {
    const migrated = {
      ...oldDb,
      version: this.SCHEMA_VERSION,
      systemConfig: oldDb.systemConfig || {
        activeModelId: 'gemini-3-flash',
        modelMetrics: []
      }
    };
    this.saveDB(migrated);
    return migrated;
  }

  private static saveDB(data: any) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Database Write Error: ", e);
      throw new Error("SQLSTATE[HY000]: General error: 1 disk I/O error");
    }
  }

  private static log(action: string, level: 'info' | 'warning' | 'error' = 'info') {
    const db = this.getDB();
    const user = db.currentUser;
    const newLog: SystemLog = {
      id: `L_${Date.now()}`,
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest',
      action,
      timestamp: new Date().toISOString(),
      level
    };
    db.logs = [newLog, ...db.logs].slice(0, 100);
    this.saveDB(db);
  }

  static auth = {
    user: (): User | null => MockDB.getDB().currentUser,
    login: (email: string, pass: string): User | string => {
      const db = MockDB.getDB();
      const user = db.users.find((u: User) => u.email === email && u.password === pass);
      if (user) {
        if (user.status === 'blocked') return "Your account has been blocked by an administrator.";
        db.currentUser = user;
        MockDB.saveDB(db);
        MockDB.log(`User Logged In: ${email}`);
        return user;
      }
      return "Invalid credentials.";
    },
    register: (name: string, email: string, pass: string, hint: string): User | string => {
      const db = MockDB.getDB();
      if (db.users.find((u: User) => u.email === email)) return "User already exists.";
      const newUser: User = { 
        id: `user_${Date.now()}`, 
        name, 
        email, 
        password: pass, 
        recoveryHint: hint, 
        role: 'student', 
        joined: new Date().toISOString(),
        status: 'active'
      };
      db.users.push(newUser);
      const userChapters = db.globalChapters.map((c: any) => ({ ...c, id: `${newUser.id}_${c.id}`, userId: newUser.id, questions: [] }));
      db.userChapters = [...(db.userChapters || []), ...userChapters];
      db.currentUser = newUser;
      MockDB.saveDB(db);
      return newUser;
    },
    recover: (email: string, hint: string, newPass: string): string => {
      const db = MockDB.getDB();
      const userIndex = db.users.findIndex((u: User) => u.email === email && u.recoveryHint === hint);
      if (userIndex !== -1) {
        if (db.users[userIndex].status === 'blocked') return "This account is blocked.";
        db.users[userIndex].password = newPass;
        MockDB.saveDB(db);
        MockDB.log(`Password Recovered for: ${email}`);
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

  static chapters = {
    all: (): Chapter[] => {
      const db = MockDB.getDB();
      const user = db.currentUser;
      if (!user) return [];
      return user.role === 'admin' ? db.globalChapters : db.userChapters.filter((c: Chapter) => c.userId === user.id);
    },
    add: (chapter: Omit<Chapter, 'id'>): Chapter => {
      const db = MockDB.getDB();
      const user = db.currentUser;
      const newId = `ch_${Date.now()}`;
      const newChapter = { ...chapter, id: newId } as Chapter;
      if (user?.role === 'admin') db.globalChapters.push(newChapter);
      else db.userChapters.push({ ...newChapter, userId: user?.id });
      MockDB.saveDB(db);
      return newChapter;
    },
    update: (id: string, updates: Partial<Chapter>): Chapter => {
      const db = MockDB.getDB();
      const user = db.currentUser;
      const key = user?.role === 'admin' ? 'globalChapters' : 'userChapters';
      db[key] = db[key].map((c: Chapter) => c.id === id ? { ...c, ...updates } : c);
      MockDB.saveDB(db);
      return db[key].find((c: Chapter) => c.id === id);
    }
  };

  static questions = {
    all: (): Question[] => MockDB.getDB().globalQuestions || [],
    add: (q: Omit<Question, 'id'>): Question => {
      const db = MockDB.getDB();
      const newQ = { ...q, id: `q_${Date.now()}` };
      db.globalQuestions = [...(db.globalQuestions || []), newQ];
      MockDB.saveDB(db);
      return newQ;
    },
    delete: (id: string) => {
      const db = MockDB.getDB();
      db.globalQuestions = db.globalQuestions.filter((q: Question) => q.id !== id);
      MockDB.saveDB(db);
    }
  };

  static tests = {
    all: (): MockTest[] => MockDB.getDB().tests.filter((t: MockTest) => t.userId === MockDB.getDB().currentUser?.id),
    getMasterMocks: () => MockDB.getDB().masterMocks,
    addMasterMock: (mock: MasterMockTest) => {
      const db = MockDB.getDB();
      db.masterMocks = [...db.masterMocks, mock];
      MockDB.saveDB(db);
      return mock;
    },
    create: (test: MockTest) => {
      const db = MockDB.getDB();
      const newTest = { ...test, userId: db.currentUser?.id };
      db.tests = [newTest, ...db.tests];
      MockDB.saveDB(db);
      return newTest;
    },
    delete: (id: string) => {
      const db = MockDB.getDB();
      db.tests = db.tests.filter((t: MockTest) => t.id !== id);
      MockDB.saveDB(db);
    }
  };

  static config = {
    get: () => MockDB.getDB().systemConfig,
    set: (config: any) => {
      const db = MockDB.getDB();
      db.systemConfig = { ...db.systemConfig, ...config };
      MockDB.saveDB(db);
      MockDB.log(`System Configuration Updated`);
    }
  };

  static admin = {
    getAllUsers: (): User[] => MockDB.getDB().users,
    addUser: (user: Omit<User, 'id' | 'joined' | 'status'>): User => {
      const db = MockDB.getDB();
      const newUser: User = {
        ...user,
        id: `user_${Date.now()}`,
        joined: new Date().toISOString(),
        status: 'active'
      };
      db.users.push(newUser);
      
      // If student, initialize chapters
      if (newUser.role === 'student') {
        const userChapters = db.globalChapters.map((c: any) => ({ 
          ...c, 
          id: `${newUser.id}_${c.id}`, 
          userId: newUser.id, 
          questions: [] 
        }));
        db.userChapters = [...(db.userChapters || []), ...userChapters];
      }
      
      MockDB.saveDB(db);
      MockDB.log(`Admin created user: ${user.email}`);
      return newUser;
    },
    deleteUser: (id: string) => {
      const db = MockDB.getDB();
      db.users = db.users.filter((u: User) => u.id !== id);
      db.userChapters = db.userChapters.filter((c: Chapter) => c.userId !== id);
      db.tests = db.tests.filter((t: MockTest) => t.userId !== id);
      MockDB.saveDB(db);
      MockDB.log(`Admin deleted user: ${id}`);
    },
    updateUser: (id: string, updates: Partial<User>) => {
      const db = MockDB.getDB();
      db.users = db.users.map((u: User) => u.id === id ? { ...u, ...updates } : u);
      MockDB.saveDB(db);
      MockDB.log(`Admin updated user: ${id}`);
    },
    getLogs: (): SystemLog[] => MockDB.getDB().logs,
    getSystemStats: () => {
      const db = MockDB.getDB();
      return {
        totalStudents: db.users.filter((u: User) => u.role === 'student').length,
        totalQuestions: (db.globalQuestions || []).length,
        totalTestsTaken: db.tests.length,
        dbSize: (JSON.stringify(db).length / 1024).toFixed(2) + ' KB',
        version: db.version
      };
    }
  };
}

export default MockDB;
