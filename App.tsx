
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SubjectTracker from './components/SubjectTracker';
import AIPlanner from './components/AIPlanner';
import AIMentor from './components/AIMentor';
import MockTests from './components/MockTests';
import DbViewer from './components/DbViewer';
import AdminPanel from './components/AdminPanel';
import LaravelReference from './components/LaravelReference';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Auth from './components/Auth';
import Toast from './components/Toast';
import MockDB from './services/mockDb';
import { Chapter, MockTest, User as UserType, Toast as ToastType } from './types';
import { Bell, Globe, Shield, RefreshCw, Activity, GraduationCap, ArrowRight, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [publicTab, setPublicTab] = useState<'home' | 'about' | 'contact' | 'auth'>('home');
  const [user, setUser] = useState<UserType | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addToast = (message: string, type: ToastType['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = useCallback(() => {
    if (!MockDB.auth.user()) return;
    setIsSyncing(true);
    setChapters(MockDB.chapters.all());
    setMockTests(MockDB.tests.all());
    setTimeout(() => setIsSyncing(false), 400);
  }, []);

  useEffect(() => {
    const currentUser = MockDB.auth.user();
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.role === 'admin') setActiveTab('admin-panel');
      refreshData();
    }
  }, [refreshData]);

  const handleLoginSuccess = () => {
    const currentUser = MockDB.auth.user();
    setUser(currentUser);
    refreshData();
    addToast(`Logged in as ${currentUser?.name}`, 'info');
    if (currentUser?.role === 'admin') setActiveTab('admin-panel');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setChapters([]);
    setMockTests([]);
    setPublicTab('home');
    addToast("Session closed successfully", 'warning');
  };

  const updateChapter = (updated: Chapter) => {
    try {
      MockDB.chapters.update(updated.id, updated);
      refreshData();
    } catch (e) {
      addToast("Database Sync Error", "error");
    }
  };

  const addMockTest = (test: MockTest) => {
    MockDB.tests.create(test);
    refreshData();
    addToast("Mock Test Result Saved to MySQL", "success");
  };

  const removeMockTest = (id: string) => {
    MockDB.tests.delete(id);
    refreshData();
    addToast("Record removed from history", "info");
  };

  // PUBLIC NAVIGATION COMPONENT
  const PublicNavbar = () => (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-[100] px-6 md:px-12 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setPublicTab('home')}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h1 className="font-black text-xl text-slate-900 tracking-tight">iitgeeprep</h1>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => setPublicTab('home')} className={`text-sm font-bold uppercase tracking-widest ${publicTab === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>Home</button>
        <button onClick={() => setPublicTab('about')} className={`text-sm font-bold uppercase tracking-widest ${publicTab === 'about' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>About Us</button>
        <button onClick={() => setPublicTab('contact')} className={`text-sm font-bold uppercase tracking-widest ${publicTab === 'contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>Contact</button>
        <button 
          onClick={() => setPublicTab('auth')} 
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-xl shadow-slate-200"
        >
          Sign In
        </button>
      </div>

      <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300 md:hidden">
          <button onClick={() => {setPublicTab('home'); setIsMobileMenuOpen(false);}} className="text-left font-bold py-2">Home</button>
          <button onClick={() => {setPublicTab('about'); setIsMobileMenuOpen(false);}} className="text-left font-bold py-2">About Us</button>
          <button onClick={() => {setPublicTab('contact'); setIsMobileMenuOpen(false);}} className="text-left font-bold py-2">Contact</button>
          <button onClick={() => {setPublicTab('auth'); setIsMobileMenuOpen(false);}} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold">Get Started</button>
        </div>
      )}
    </nav>
  );

  // LOGGED IN DASHBOARD VIEW
  if (user) {
    const renderContent = () => {
      // Internal routes no longer include About and Contact
      if (user.role === 'admin') {
        switch (activeTab) {
          case 'admin-panel': return <AdminPanel />;
          case 'db-viewer': return <DbViewer onNavigate={setActiveTab} />;
          case 'laravel': return <LaravelReference />;
          default: return <AdminPanel />;
        }
      }

      switch (activeTab) {
        case 'dashboard': return <Dashboard chapters={chapters} mockTests={mockTests} />;
        case 'subjects': return <SubjectTracker chapters={chapters} updateChapter={updateChapter} />;
        case 'tests': return <MockTests tests={mockTests} addTest={addMockTest} removeTest={removeMockTest} />;
        case 'planner': return <AIPlanner chapters={chapters} />;
        case 'mentor': return <AIMentor />;
        default: return <Dashboard chapters={chapters} mockTests={mockTests} />;
      }
    };

    return (
      <div className="flex min-h-screen bg-slate-100 animate-in fade-in duration-700">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} role={user.role} />
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200">
                <Globe className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-widest">iitgeeprep_NODE: MYSQL_8.0</span>
              </div>
              {isSyncing && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 rounded-lg text-indigo-600">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">IO Sync</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{user.name}</p>
                  <div className="flex items-center justify-end gap-1">
                     <Shield className="w-2 h-2 text-indigo-500" />
                     <span className="text-[9px] text-indigo-600 font-bold uppercase tracking-tighter">{user.role}</span>
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xl ${user.role === 'admin' ? 'bg-amber-600 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="p-10 max-w-7xl mx-auto min-h-[calc(100vh-8rem)]">
            {renderContent()}
          </div>
          <footer className="p-8 text-center text-slate-400 text-[10px] border-t border-slate-200 bg-white font-mono uppercase tracking-widest">
            iitgeeprep • Laravel 11.x • PHP 8.3 • AI Optimized
          </footer>
        </main>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // PUBLIC VIEW RENDERER
  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <PublicNavbar />
      
      <main className="max-w-7xl mx-auto p-6 md:p-12">
        {publicTab === 'home' && (
          <div className="space-y-24 py-12">
            {/* Hero Section */}
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-10 duration-1000">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-xs font-bold uppercase tracking-widest">
                🚀 Now powered by Gemini 3 Flash
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
                The Smartest Way to Crack <span className="text-indigo-600">IIT JEE.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Experience AI-driven subject tracking, personalized study plans, and instant mentor feedback. Built for the modern aspirant.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => setPublicTab('auth')}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-[2rem] font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 flex items-center gap-2"
                >
                  Get Started Free <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setPublicTab('about')}
                  className="px-10 py-5 bg-white text-slate-700 border border-slate-200 rounded-[2rem] font-bold text-lg hover:bg-slate-50 transition-all"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Feature Teasers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Relentless Tracking', desc: 'Monitor your progress across 50+ chapters with precision MySQL analytics.', icon: Activity, color: 'text-indigo-600' },
                { title: 'AI Study Planner', desc: 'Gemini analyzes your weaknesses to build high-intensity 7-day master plans.', icon: RefreshCw, color: 'text-emerald-600' },
                { title: 'Intelligent Mentor', desc: '24/7 access to a JEE specialized mentor for strategy and doubt solving.', icon: Shield, color: 'text-amber-600' },
              ].map((f, i) => (
                <div key={i} className="glass-card p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                  <f.icon className={`w-12 h-12 ${f.color} mb-6`} />
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {publicTab === 'about' && <AboutUs />}
        {publicTab === 'contact' && <ContactUs onSuccess={(m) => addToast(m, 'success')} />}
        {publicTab === 'auth' && (
          <div className="max-w-md mx-auto py-12">
            <Auth onLogin={handleLoginSuccess} />
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-indigo-600 w-8 h-8" />
            <h1 className="font-black text-xl text-slate-900 tracking-tight">iitgeeprep</h1>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
            <button onClick={() => setPublicTab('about')} className="hover:text-indigo-600">Privacy</button>
            <button onClick={() => setPublicTab('about')} className="hover:text-indigo-600">Terms</button>
            <button onClick={() => setPublicTab('contact')} className="hover:text-indigo-600">Support</button>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.3em]">
            &copy; 2025 iitgeeprep • Laravel • PHP • AI
          </p>
        </div>
      </footer>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
