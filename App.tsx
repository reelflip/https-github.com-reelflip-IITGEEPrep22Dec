
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
// Fix: Added missing 'Zap' to lucide-react imports to resolve "Cannot find name 'Zap'" error
import { Bell, Globe, Shield, RefreshCw, Activity, GraduationCap, ArrowRight, Menu, X, Terminal, Zap } from 'lucide-react';

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
      if (currentUser.role === 'admin') setActiveTab('admin-stats');
      refreshData();
    }
  }, [refreshData]);

  const handleLoginSuccess = () => {
    const currentUser = MockDB.auth.user();
    setUser(currentUser);
    refreshData();
    addToast(`Authenticated: ${currentUser?.name}`, 'success');
    if (currentUser?.role === 'admin') setActiveTab('admin-stats');
    else setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setChapters([]);
    setMockTests([]);
    setPublicTab('home');
    addToast("Session terminated", 'info');
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
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-[100] px-6 md:px-12 flex items-center justify-between shadow-sm">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => setPublicTab('home')}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-100">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h1 className="font-black text-xl text-slate-900 tracking-tight">iitgeeprep</h1>
      </div>

      <div className="hidden md:flex items-center gap-10">
        <button onClick={() => setPublicTab('home')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${publicTab === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>Home</button>
        <button onClick={() => setPublicTab('about')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${publicTab === 'about' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>About Us</button>
        <button onClick={() => setPublicTab('contact')} className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${publicTab === 'contact' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}>Contact</button>
        <button 
          onClick={() => setPublicTab('auth')} 
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          Portal Access
        </button>
      </div>

      <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X /> : <Menu />}
      </button>

      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-white border-b border-slate-200 p-8 flex flex-col gap-6 animate-in slide-in-from-top duration-300 md:hidden shadow-2xl">
          <button onClick={() => {setPublicTab('home'); setIsMobileMenuOpen(false);}} className="text-left font-black uppercase tracking-widest text-xs py-2">Home</button>
          <button onClick={() => {setPublicTab('about'); setIsMobileMenuOpen(false);}} className="text-left font-black uppercase tracking-widest text-xs py-2">About Us</button>
          <button onClick={() => {setPublicTab('contact'); setIsMobileMenuOpen(false);}} className="text-left font-black uppercase tracking-widest text-xs py-2">Contact</button>
          <button onClick={() => {setPublicTab('auth'); setIsMobileMenuOpen(false);}} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs">Join iitgeeprep</button>
        </div>
      )}
    </nav>
  );

  // LOGGED IN VIEW RENDERER
  if (user) {
    const renderContent = () => {
      // Role-based logic
      if (user.role === 'admin') {
        const adminViews: Record<string, React.ReactNode> = {
          'admin-stats': <AdminPanel initialTab="stats" />, 
          'admin-ai': <AdminPanel initialTab="ai-config" />,
          'admin-curriculum': <AdminPanel initialTab="curriculum" />,
          'admin-questions': <AdminPanel initialTab="questions" />,
          'admin-tests': <AdminPanel initialTab="admin-tests" />,
          'admin-users': <AdminPanel initialTab="users" />,
          'db-viewer': <DbViewer onNavigate={setActiveTab} />,
          'laravel': <LaravelReference />,
          'about': <AboutUs />,
          'contact': <ContactUs onSuccess={(m) => addToast(m, 'success')} />,
        };
        return adminViews[activeTab] || adminViews['admin-stats'];
      }

      const studentViews: Record<string, React.ReactNode> = {
        'dashboard': <Dashboard chapters={chapters} mockTests={mockTests} />,
        'subjects': <SubjectTracker chapters={chapters} updateChapter={updateChapter} />,
        'tests': <MockTests tests={mockTests} addTest={addMockTest} removeTest={removeMockTest} />,
        'planner': <AIPlanner chapters={chapters} />,
        'mentor': <AIMentor />,
        'about': <AboutUs />,
        'contact': <ContactUs onSuccess={(m) => addToast(m, 'success')} />,
      };
      return studentViews[activeTab] || studentViews['dashboard'];
    };

    return (
      <div className="flex min-h-screen bg-[#f1f5f9] animate-in fade-in duration-1000">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} role={user.role} />
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/30">
          <header className="h-16 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-[40] shadow-sm">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 px-4 py-1.5 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                   MySQL_NODE: 8.3.4
                </span>
              </div>
              {isSyncing && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50/80 rounded-xl text-indigo-600 border border-indigo-100 animate-in fade-in">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">IO Burst Active</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-8">
              <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-2xl relative transition-all group">
                <Bell className="w-5.5 h-5.5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-4 pl-8 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{user.name}</p>
                  <div className="flex items-center justify-end gap-1.5">
                     <Shield className={`w-2.5 h-2.5 ${user.role === 'admin' ? 'text-amber-500' : 'text-indigo-500'}`} />
                     <span className={`text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {user.role} verified
                     </span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center text-white font-black text-sm shadow-2xl transition-transform hover:rotate-3 ${user.role === 'admin' ? 'bg-amber-600 shadow-amber-900/10' : 'bg-indigo-600 shadow-indigo-900/10'}`}>
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="p-12 max-w-7xl mx-auto min-h-[calc(100vh-8rem)] relative">
            {renderContent()}
          </div>
          
          <footer className="p-10 text-center border-t border-slate-200 bg-white">
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-2 opacity-30 group cursor-default">
                  <Terminal className="w-4 h-4 text-slate-900" />
                  <span className="text-[10px] text-slate-900 font-mono uppercase tracking-[0.5em]">iitgeeprep_core_env</span>
               </div>
               <p className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.4em]">
                 Laravel 11.4 • PHP 8.3.2 • Powered by Google Gemini-3-Flash
               </p>
            </div>
          </footer>
        </main>
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  // PUBLIC VIEW RENDERER (Keep as is, but ensure consistency)
  return (
    <div className="min-h-screen bg-white pt-20">
      <PublicNavbar />
      <main className="max-w-7xl mx-auto p-8 md:p-16">
        {publicTab === 'home' && (
          <div className="space-y-32 py-16">
            <div className="text-center space-y-12 animate-in slide-in-from-bottom-12 duration-1000">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                <Zap className="w-4 h-4 fill-indigo-700" /> Intelligence Engine v3.0 Active
              </div>
              <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] max-w-5xl mx-auto">
                Next-Gen Preparation for <span className="text-indigo-600">IIT JEE.</span>
              </h1>
              <p className="text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
                Experience the world's first AI-integrated tracker. Subject analytics, personalized roadmap generation, and on-demand mentoring.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={() => setPublicTab('auth')}
                  className="px-14 py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black text-lg shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 uppercase tracking-widest"
                >
                  Start Preparing <ArrowRight className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setPublicTab('about')}
                  className="px-14 py-6 bg-white text-slate-900 border-2 border-slate-200 rounded-[2.5rem] font-black text-lg hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                  The Blueprint
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { title: 'MySQL Persistence', desc: 'Enterprise-grade progress logging across 50+ subject units with precise data modeling.', icon: Activity, color: 'text-indigo-600' },
                { title: 'Gemini Planner', desc: 'Instant 7-day study roadmap generation tailored to your performance bottlenecks.', icon: RefreshCw, color: 'text-emerald-600' },
                { title: 'Active Guard', desc: 'Real-time session monitoring and evaluation for competitive CBT mock environments.', icon: Shield, color: 'text-amber-600' },
              ].map((f, i) => (
                <div key={i} className="glass-card p-12 rounded-[3.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white/50">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform shadow-inner">
                    <f.icon className={`w-8 h-8 ${f.color}`} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-lg">{f.desc}</p>
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

      <footer className="bg-slate-50 border-t border-slate-200 py-20 px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="font-black text-2xl text-slate-900 tracking-tight">iitgeeprep</h1>
          </div>
          <div className="flex gap-12 text-xs font-black text-slate-400 uppercase tracking-[0.25em]">
            <button onClick={() => setPublicTab('about')} className="hover:text-indigo-600 transition-colors">Safety</button>
            <button onClick={() => setPublicTab('about')} className="hover:text-indigo-600 transition-colors">Terms</button>
            <button onClick={() => setPublicTab('contact')} className="hover:text-indigo-600 transition-colors">System Help</button>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.4em]">
            &copy; 2025 iitgeeprep • Distributed via Cloudflare
          </p>
        </div>
      </footer>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
