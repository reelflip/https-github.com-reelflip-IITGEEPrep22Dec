
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { 
  Users, BookOpen, BarChart2, ShieldCheck, Plus, ListFilter, 
  ClipboardCheck, Database, Zap, Cpu, Search, Trash2, Tag, 
  CheckCircle, Clock, Save, FilePlus, BrainCircuit, Activity, 
  LineChart as LucideLineChart, MousePointer2, X, ShieldAlert, 
  UserPlus, Lock, Unlock, Edit3, Filter, Rocket, AlertTriangle,
  Cog, Gauge, Server, Globe, HardDrive, RefreshCw
} from 'lucide-react';
import { Subject, ChapterStatus, Question, MasterMockTest, AIModelConfig, User, UserRole } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import SubjectTracker from './SubjectTracker';

interface AdminPanelProps {
  initialTab: 'stats' | 'curriculum' | 'questions' | 'admin-tests' | 'ai-config' | 'users';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLive, setIsLive] = useState(MockDB.isLiveMode());
  const stats = MockDB.admin.getSystemStats();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [masterMocks, setMasterMocks] = useState<MasterMockTest[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(MockDB.config.get());
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshPanel = async () => {
    setIsSyncing(true);
    try {
      const [qs, mm, ch, us] = await Promise.all([
        MockDB.questions.all(),
        MockDB.tests.getMasterMocks(),
        MockDB.chapters.all(),
        MockDB.admin.getAllUsers()
      ]);
      setQuestions(qs);
      setMasterMocks(mm);
      setChapters(ch);
      setAllUsers(us);
      setSystemConfig(MockDB.config.get());
      setIsLive(MockDB.isLiveMode());
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  useEffect(() => {
    refreshPanel();
  }, [initialTab]);

  const handleToggleDataMode = () => {
    const nextMode = !isLive;
    if (window.confirm(`Switch to ${nextMode ? 'LIVE MYSQL' : 'LOCAL MOCK'} mode? This will reload the application.`)) {
      MockDB.setLiveMode(nextMode);
      setIsLive(nextMode);
      window.location.reload();
    }
  };

  const handleIntensityDefaultChange = (intensity: string) => {
    MockDB.config.set({ defaultIntensity: intensity });
    refreshPanel();
  };

  const renderSectionHeader = (title: string, subtitle: string) => (
    <div className="mb-10 flex justify-between items-end">
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3 uppercase">{title}</h2>
        <p className="text-slate-500 text-base font-medium opacity-80">{subtitle}</p>
      </div>
      {isSyncing && (
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Active I/O</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {initialTab === 'stats' && (
        <div className="space-y-10">
          {renderSectionHeader('System Telemetry', 'Live monitoring of core database nodes.')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Question Registry', value: stats.totalQuestions, icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Exam Index', value: stats.totalTestsTaken, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Active Engine', value: stats.mode, icon: Database, color: 'text-rose-600', bg: 'bg-rose-100' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-[2.5rem] shadow-sm border border-slate-100 bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}><stat.icon className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {initialTab === 'ai-config' && (
        <div className="space-y-12">
          {renderSectionHeader('Core Logic Settings', 'Manage data orchestration and AI behaviors.')}
          
          <div className="glass-card p-12 rounded-[4rem] border border-slate-100 bg-white shadow-2xl relative overflow-hidden mb-12">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
              <Database size={240} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                   <Server className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Data Orchestration Switch</h3>
                  <p className="text-slate-500 font-medium text-lg">Switch between Simulated Browser Storage and Production MySQL.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className={`p-8 rounded-[3rem] border transition-all ${isLive ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Persistence Node</span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                        {isLive ? 'PHP_MYSQL_LIVE' : 'LOCAL_STORAGE_MOCK'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      {isLive 
                        ? 'Production Mode: System is targeting XAMPP MySQL. All data is persistent and shared across sessions.' 
                        : 'Sandbox Mode: System is using Browser LocalStorage. Data is local to this browser only.'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleToggleDataMode}
                    className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
                      isLive 
                        ? 'bg-slate-900 text-white hover:bg-black shadow-slate-200' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {isLive ? <Zap className="w-6 h-6 text-amber-400" /> : <Globe className="w-6 h-6" />}
                    {isLive ? 'Switch to Mock Storage' : 'Activate Live MySQL'}
                  </button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center border border-white/10">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck className="text-indigo-400 w-8 h-8" />
                    <h5 className="font-black uppercase tracking-widest text-xs">Environment Protocol</h5>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                    Toggling data modes requires a system reload. Data is not synchronized between modes. Ensure <b>api.php</b> and <b>setup.php</b> are deployed for Live mode.
                  </p>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                     <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Requirements</p>
                     <ul className="text-[9px] text-slate-500 font-bold space-y-1.5 uppercase">
                        <li>• XAMPP Apache & MySQL Running</li>
                        <li>• Database: jee_tracker_db created</li>
                        <li>• /api.php reachable at root</li>
                     </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of Tabs unchanged ... */}
      {initialTab === 'curriculum' && (
        <div className="space-y-8">
          {renderSectionHeader('Syllabus Builder', 'Configure the multi-subject prep hierarchy.')}
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
             <SubjectTracker chapters={chapters} updateChapter={(updated) => { MockDB.chapters.update(updated.id, updated); refreshPanel(); }} isAdmin={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
