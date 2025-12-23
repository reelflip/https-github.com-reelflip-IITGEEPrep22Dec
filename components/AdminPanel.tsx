
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
    MockDB.setLiveMode(nextMode);
    setIsLive(nextMode);
    // Force a full application reload to reset all data providers safely
    window.location.reload();
  };

  // --- User Management State ---
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'student' as UserRole });

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const [qForm, setQForm] = useState<Omit<Question, 'id'>>({
    subject: 'Physics',
    chapterId: '',
    examTag: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const [mockName, setMockName] = useState('');
  const [mockDuration, setMockDuration] = useState(180);
  const [selectedQIds, setSelectedQIds] = useState<Set<string>>(new Set());

  const handleIntensityDefaultChange = (intensity: string) => {
    MockDB.config.set({ defaultIntensity: intensity });
    refreshPanel();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await MockDB.admin.addUser({ ...userForm, recoveryHint: 'admin_manual_entry' });
    setShowAddUser(false);
    setUserForm({ name: '', email: '', password: '', role: 'student' });
    refreshPanel();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowEditUser(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updates: Partial<User> = { name: userForm.name, email: userForm.email, role: userForm.role };
    if (userForm.password) updates.password = userForm.password;
    await MockDB.admin.updateUser(editingUser.id, updates);
    setShowEditUser(false);
    setEditingUser(null);
    refreshPanel();
  };

  const handleDeleteUser = async (id: string) => {
    if (id === MockDB.auth.user()?.id) return alert("System Integrity Error: Cannot delete primary admin session.");
    if (window.confirm('IRREVERSIBLE ACTION: Delete user account and all performance telemetry?')) {
      await MockDB.admin.deleteUser(id);
      refreshPanel();
    }
  };

  const handleToggleBlock = async (user: User) => {
    if (user.id === MockDB.auth.user()?.id) return alert("System Protection: Self-blocking is restricted.");
    await MockDB.admin.updateUser(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' });
    refreshPanel();
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await MockDB.questions.add({ ...qForm, chapterId: qForm.chapterId || undefined });
    setShowAddQuestion(false);
    setQForm({ subject: 'Physics', chapterId: '', examTag: '', text: '', options: ['', '', '', ''], correctAnswer: 0 });
    refreshPanel();
  };

  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Delete this unit from global registry?')) {
      await MockDB.questions.delete(id);
      refreshPanel();
    }
  };

  const handleCreateMock = async () => {
    if (!mockName || selectedQIds.size === 0) return alert("Deployment Failed: Missing name or unit selection.");
    await MockDB.tests.addMasterMock({
      id: `mock_${Date.now()}`,
      name: mockName,
      durationMinutes: mockDuration,
      totalMarks: selectedQIds.size * 4,
      questionIds: Array.from(selectedQIds)
    });
    setMockName('');
    setSelectedQIds(new Set());
    refreshPanel();
    alert("NETWORK DEPLOYMENT SUCCESS: Master Test is now live for all students.");
  };

  const handleDeleteMasterMock = async (id: string) => {
    if (window.confirm('SYSTEM WARNING: Decommissioning this test will remove it from all student portals.')) {
      await MockDB.tests.deleteMasterMock(id);
      refreshPanel();
    }
  };

  const toggleQSelection = (id: string) => {
    const next = new Set(selectedQIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedQIds(next);
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
          <span className="text-[10px] font-black uppercase tracking-widest">Querying Node</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {initialTab === 'stats' && (
        <div className="space-y-10">
          {renderSectionHeader('Network Telemetry', 'Aggregated health metrics from the integrated preparation nodes.')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Global Registry', value: stats.totalQuestions, icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Attempt Index', value: stats.totalTestsTaken, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'MySQL Node Mode', value: stats.mode, icon: Database, color: 'text-rose-600', bg: 'bg-rose-100' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-[2.5rem] shadow-sm border border-slate-100 bg-white hover:shadow-xl transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}><stat.icon className="w-5 h-5" /></div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {initialTab === 'ai-config' && (
        <div className="space-y-12">
          {renderSectionHeader('Logic Engine Controls', 'Manage the underlying data architecture and AI strategy parameters.')}
          
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
                  <p className="text-slate-500 font-medium text-lg italic">Seamlessly transition between Browser Storage and Production MySQL.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className={`p-8 rounded-[3rem] border transition-all ${isLive ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Persistence Node</span>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
                        {isLive ? 'LIVE_PRODUCTION' : 'MOCK_SANDBOX'}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isLive ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                          {isLive ? <Globe className="w-8 h-8" /> : <HardDrive className="w-8 h-8" />}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">
                            {isLive 
                              ? 'System is targeting XAMPP / Laravel API endpoints. Read/Write operations are real and persistent.' 
                              : 'System is targeting Browser LocalStorage. Perfect for offline development and local testing.'}
                          </p>
                       </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleToggleDataMode}
                    className={`w-full py-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 ${
                      isLive 
                        ? 'bg-slate-900 text-white hover:bg-black' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                    }`}
                  >
                    {isLive ? <Zap className="w-6 h-6 text-amber-400" /> : <Globe className="w-6 h-6" />}
                    {isLive ? 'Switch to Mock Data' : 'Activate Live Database'}
                  </button>
                </div>

                <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center border border-white/10 shadow-inner">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldCheck className="text-indigo-400 w-8 h-8" />
                    <h5 className="font-black uppercase tracking-widest text-xs">Migration Protocol</h5>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 font-medium">
                    Toggling data modes will trigger a <b>System Purge</b> and browser refresh to ensure session integrity. Data is not automatically synced between modes.
                  </p>
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                     <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest leading-none">Requirements for Live Mode</p>
                     <ul className="text-[10px] text-slate-500 font-bold space-y-1.5">
                        <li className="flex items-center gap-2">• Apache / MySQL service active</li>
                        <li className="flex items-center gap-2">• setup.php executed at /iitgeeprep</li>
                        <li className="flex items-center gap-2">• Endpoints active at /api/*</li>
                     </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-3"><Cog className="w-5 h-5 text-indigo-600" /> Global Assistant Config</h3>
              <div className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-sm space-y-10">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Master Intensity Governor</label>
                   <div className="grid grid-cols-3 gap-4">
                      {['low', 'medium', 'high'].map(intensity => (
                        <button 
                          key={intensity}
                          onClick={() => handleIntensityDefaultChange(intensity)}
                          className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${systemConfig.defaultIntensity === intensity ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200'}`}
                        >
                          {intensity}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner"><Zap className="w-5 h-5" /></div>
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Logic Node 1.2</span>
                   </div>
                   <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-emerald-100">Optimal Performance</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] flex items-center gap-3"><Gauge className="w-5 h-5 text-emerald-600" /> Infrastructure Analytics</h3>
              <div className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-sm flex flex-col min-h-[400px]">
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Engine Uptime</p>
                     <p className="text-5xl font-black text-slate-900 tracking-tighter">100<span className="text-2xl text-indigo-600">%</span></p>
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Latent Delay</p>
                     <p className="text-5xl font-black text-emerald-600 tracking-tighter">0.1<span className="text-2xl ml-1">ms</span></p>
                  </div>
                </div>
                <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={systemConfig.modelMetrics || [
                        { date: '01', accuracy: 90 }, { date: '02', accuracy: 95 }, { date: '03', accuracy: 93 }, { date: '04', accuracy: 98 }, { date: '05', accuracy: 100 }
                      ]}>
                        <defs>
                          <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorAcc)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {initialTab === 'curriculum' && (
        <div className="space-y-8">
          {renderSectionHeader('Syllabus Architect', 'Configure the multi-subject prep hierarchy and study material repository.')}
          <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm">
             <SubjectTracker chapters={chapters} updateChapter={(updated) => { MockDB.chapters.update(updated.id, updated); refreshPanel(); }} isAdmin={true} />
          </div>
        </div>
      )}

      {initialTab === 'questions' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div>{renderSectionHeader('Question Registry', 'Master repository of standard JEE examination units.')}</div>
            <button onClick={() => setShowAddQuestion(true)} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all active:scale-95 mb-10"><Plus className="w-5 h-5" /> Import Entry</button>
          </div>
          <div className="glass-card rounded-[3rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
                  <tr><th className="px-10 py-7">Domain</th><th className="px-10 py-7">Content Spec</th><th className="px-10 py-7 text-right">Operations</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {questions.length > 0 ? questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-8">
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 ${q.subject === 'Physics' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{q.subject}</span>
                      </td>
                      <td className="px-10 py-8 max-w-lg">
                        <p className="text-slate-800 text-sm font-bold line-clamp-2 leading-relaxed">{q.text}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-mono">{q.id}</p>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-4 text-slate-300 hover:text-rose-600 transition-all bg-white border border-slate-100 rounded-2xl hover:shadow-xl group-hover:border-rose-100">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="py-20 text-center">
                         <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry Empty</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {initialTab === 'admin-tests' && (
        <div className="space-y-12">
          {renderSectionHeader('Exam Forge', 'Construct and deploy official Computer Based Tests to the entire network.')}
          
          <section className="space-y-8">
            <div className="flex items-center gap-3 px-6">
              <Rocket className="w-6 h-6 text-indigo-600" />
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">Active Network Mocks</h3>
              <div className="h-px flex-1 bg-slate-100 mx-6"></div>
              <span className="text-[10px] font-black bg-slate-900 text-white px-4 py-1.5 rounded-full">{masterMocks.length} Units</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              {masterMocks.map(mock => (
                <div key={mock.id} className="glass-card p-10 rounded-[3rem] bg-white border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-2xl transition-all border-b-8 border-b-slate-900">
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[1.5rem] flex items-center justify-center font-black border border-slate-200">
                         {mock.name.charAt(0)}
                      </div>
                      <button 
                        onClick={() => handleDeleteMasterMock(mock.id)}
                        className="p-4 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                   <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{mock.name}</h4>
                   <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-xl">
                        <Clock className="w-4 h-4" /> {mock.durationMinutes}M
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-xl">
                        <CheckCircle className="w-4 h-4" /> {mock.totalMarks} Marks
                      </span>
                   </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-16 border-t border-slate-100">
            <div className="flex items-center gap-4 px-6 mb-12">
              <FilePlus className="w-6 h-6 text-indigo-600" />
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.4em]">New Test Assembly</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1">
                <div className="glass-card p-10 rounded-[4rem] border border-slate-100 bg-white shadow-2xl sticky top-28">
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mock Designation</label>
                      <input type="text" value={mockName} onChange={e => setMockName(e.target.value)} placeholder="e.g. JEE ADVANCED MOCK 01" className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-sm shadow-inner" />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Allocation (Min)</label>
                      <input type="number" value={mockDuration} onChange={e => setMockDuration(parseInt(e.target.value))} className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-black text-sm shadow-inner" />
                    </div>

                    <div className="p-8 bg-slate-900 rounded-[3rem] text-white">
                       <div className="flex justify-between items-center mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Content Load</span>
                          <span className="text-xl font-black text-indigo-400">{selectedQIds.size} Units</span>
                       </div>
                       <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(100, (selectedQIds.size / 20) * 100)}%` }} />
                       </div>
                    </div>

                    <button 
                      onClick={handleCreateMock} 
                      className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 transition-all text-sm active:scale-95 flex items-center justify-center gap-4"
                    >
                      <Zap className="w-5 h-5 fill-white" /> Deploy to Node
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-4 px-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Available Question Registry</h3>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{questions.length} Pool Units</span>
                </div>
                <div className="grid grid-cols-1 gap-5 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
                  {questions.map((q) => (
                    <button key={q.id} onClick={() => toggleQSelection(q.id)} className={`w-full text-left p-8 rounded-[3rem] border-4 transition-all flex items-start gap-8 group ${selectedQIds.has(q.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}>
                      <div className={`mt-2 w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0 ${selectedQIds.has(q.id) ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl rotate-12' : 'border-slate-200 bg-white group-hover:border-indigo-300'}`}>
                        {selectedQIds.has(q.id) ? <CheckCircle className="w-6 h-6" /> : <Plus className="w-6 h-6 text-slate-200" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${q.subject === 'Physics' ? 'text-indigo-500' : 'text-emerald-500'}`}>{q.subject}</span>
                           <span className="w-2 h-2 bg-slate-200 rounded-full"></span>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{chapters.find(c => c.id === q.chapterId)?.name || 'General Inventory'}</span>
                        </div>
                        <p className="text-lg text-slate-800 font-bold leading-relaxed">{q.text}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {initialTab === 'users' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div>{renderSectionHeader('Identity Management', 'Full administrative control over network user access and telemetry.')}</div>
            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 active:scale-95 mb-10"><UserPlus className="w-6 h-6" /> Provision User</button>
          </div>
          <div className="glass-card rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.4em]">
                  <tr><th className="px-12 py-8">Participant</th><th className="px-12 py-8">Authorization</th><th className="px-12 py-8">Status</th><th className="px-12 py-8 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-all group ${user.status === 'blocked' ? 'bg-rose-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-12 py-9">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-lg shadow-lg group-hover:rotate-3 transition-transform ${user.role === 'admin' ? 'bg-slate-900' : 'bg-indigo-600'}`}>{user.name.charAt(0)}</div>
                          <div>
                            <p className="font-black text-slate-900 text-lg tracking-tight">{user.name}</p>
                            <p className="text-slate-400 text-xs font-medium lowercase tracking-wide">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-9">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${user.role === 'admin' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-12 py-9">
                        <div className="flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full shadow-sm ${user.status === 'blocked' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-500 shadow-emerald-200'}`}></div>
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{user.status || 'active'}</span>
                        </div>
                      </td>
                      <td className="px-12 py-9 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditUser(user)} className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl hover:shadow-xl"><Edit3 className="w-5 h-5" /></button>
                          <button onClick={() => handleToggleBlock(user)} className={`p-4 rounded-2xl border transition-all ${user.status === 'blocked' ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:shadow-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100 hover:shadow-rose-100'}`}>{user.status === 'blocked' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-4 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-2xl hover:shadow-xl"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
