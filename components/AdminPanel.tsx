
// AdminPanel provides the system administrative interface for managing users, curriculum, questions, and tests.
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { 
  Users, BookOpen, BarChart2, ShieldCheck, Plus, ListFilter, 
  ClipboardCheck, Database, Zap, Cpu, Search, Trash2, Tag, 
  CheckCircle, Clock, Save, FilePlus, BrainCircuit, Activity, 
  LineChart as LucideLineChart, MousePointer2, X, ShieldAlert, 
  UserPlus, Lock, Unlock, Edit3, Filter, Rocket, AlertTriangle,
  Cog, Gauge, Server, Globe, HardDrive, RefreshCw, Layers, ShieldX,
  Target
} from 'lucide-react';
import { Subject, ChapterStatus, Question, MasterMockTest, AIModelConfig, User, UserRole } from '../types';
import SubjectTracker from './SubjectTracker';

interface AdminPanelProps {
  initialTab: 'stats' | 'curriculum' | 'questions' | 'admin-tests' | 'ai-config' | 'users';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLive, setIsLive] = useState(MockDB.isLiveMode());
  const [stats, setStats] = useState(MockDB.admin.getSystemStats());
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [masterMocks, setMasterMocks] = useState<MasterMockTest[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Test Factory State
  const [showAddTest, setShowAddTest] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    durationMinutes: 180,
    totalMarks: 300,
    questionIds: [] as string[]
  });

  // Fix: Added missing state for question management
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQ, setNewQ] = useState<Omit<Question, 'id'>>({
    subject: 'Physics',
    chapterId: '',
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

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
      setStats(MockDB.admin.getSystemStats());
      setIsLive(MockDB.isLiveMode());
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  useEffect(() => {
    refreshPanel();
  }, [initialTab]);

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTest.questionIds.length === 0) return alert("Select at least one question!");
    await MockDB.tests.addMasterMock(newTest);
    setShowAddTest(false);
    refreshPanel();
    setNewTest({ name: '', durationMinutes: 180, totalMarks: 300, questionIds: [] });
  };

  // Fix: Added handleAddQuestion implementation
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.chapterId) return alert("Select a chapter!");
    await MockDB.questions.add(newQ);
    setShowAddQuestion(false);
    refreshPanel();
    setNewQ({
      subject: 'Physics',
      chapterId: '',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const deleteMasterMock = async (id: string) => {
    if (!confirm("Are you sure you want to dismantle this exam structure?")) return;
    await MockDB.tests.deleteMasterMock(id);
    refreshPanel();
  };

  const toggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    await MockDB.admin.updateUserStatus(user.id, nextStatus);
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
              { label: 'Active Students', value: allUsers.filter(u => u.role === 'student').length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Question Registry', value: questions.length, icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Factory Blueprints', value: masterMocks.length, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-100' },
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

      {initialTab === 'admin-tests' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            {renderSectionHeader('Test Factory', 'Construct and deploy official CBT examinations.')}
            <button 
              onClick={() => setShowAddTest(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 mb-10"
            >
              <Plus className="w-5 h-5" /> Construct Mock
            </button>
          </div>

          {showAddTest && (
            <div className="glass-card p-8 rounded-[2rem] border border-indigo-100 bg-white mb-10 animate-in zoom-in-95">
              <h3 className="text-xl font-bold mb-6">Exam Blueprint Builder</h3>
              <form onSubmit={handleAddTest} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mock Name</label>
                    <input required value={newTest.name} onChange={e => setNewTest({...newTest, name: e.target.value})} className="w-full p-3 border rounded-xl" placeholder="Full Syllabus Test 01" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Minutes</label>
                    <input required type="number" value={newTest.durationMinutes} onChange={e => setNewTest({...newTest, durationMinutes: parseInt(e.target.value)})} className="w-full p-3 border rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Marks</label>
                    <input required type="number" value={newTest.totalMarks} onChange={e => setNewTest({...newTest, totalMarks: parseInt(e.target.value)})} className="w-full p-3 border rounded-xl" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pick Questions ({newTest.questionIds.length} Selected)</label>
                  <div className="h-64 overflow-y-auto border rounded-2xl p-4 bg-slate-50 space-y-2">
                    {questions.map(q => (
                      <label key={q.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-indigo-300">
                        <input 
                          type="checkbox" 
                          checked={newTest.questionIds.includes(q.id)}
                          onChange={() => {
                            const ids = newTest.questionIds.includes(q.id) 
                              ? newTest.questionIds.filter(id => id !== q.id)
                              : [...newTest.questionIds, q.id];
                            setNewTest({...newTest, questionIds: ids});
                          }}
                        />
                        <span className="text-xs font-bold text-indigo-600 w-16 uppercase">{q.subject}</span>
                        <span className="text-xs text-slate-600 truncate">{q.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Deploy to Platform</button>
                  <button type="button" onClick={() => setShowAddTest(false)} className="px-8 py-3 text-slate-500 font-bold">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {masterMocks.map(mock => (
              <div key={mock.id} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm group hover:border-indigo-300 transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Layers className="w-6 h-6" /></div>
                   <button onClick={() => deleteMasterMock(mock.id)} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 className="w-5 h-5" /></button>
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-4">{mock.name}</h4>
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {mock.durationMinutes}m</span>
                  <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {mock.totalMarks}M</span>
                  <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> {Array.isArray(mock.questionIds) ? mock.questionIds.length : JSON.parse(mock.questionIds as any).length} MCQs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {initialTab === 'users' && (
        <div className="space-y-10">
          {renderSectionHeader('User Governance', 'Manage student credentials and system access.')}
          <div className="glass-card bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Aspirant</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Joined</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50">
                    <td className="px-8 py-5 font-bold text-slate-800">{user.name}</td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-mono">{user.email}</td>
                    <td className="px-8 py-5 text-xs text-slate-400">{new Date(user.joined).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.status === 'blocked' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => toggleUserStatus(user)}
                          className={`p-2 rounded-xl transition-all ${user.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                        >
                          {user.status === 'blocked' ? <ShieldCheck className="w-5 h-5" /> : <ShieldX className="w-5 h-5" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {initialTab === 'questions' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            {renderSectionHeader('Question Bank', 'Global repository of IIT JEE MCQs.')}
            <button 
              onClick={() => setShowAddQuestion(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 mb-10"
            >
              <Plus className="w-5 h-5" /> New MCQ
            </button>
          </div>

          {showAddQuestion && (
            <div className="glass-card p-8 rounded-[2rem] border border-indigo-100 bg-white mb-10 animate-in zoom-in-95">
              <h3 className="text-xl font-bold mb-6">Create New Question</h3>
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <select 
                    value={newQ.subject} 
                    onChange={e => setNewQ({...newQ, subject: e.target.value as Subject})}
                    className="p-3 border rounded-xl outline-none"
                  >
                    <option>Physics</option><option>Chemistry</option><option>Mathematics</option>
                  </select>
                  <select 
                    value={newQ.chapterId} 
                    onChange={e => setNewQ({...newQ, chapterId: e.target.value})}
                    className="p-3 border rounded-xl outline-none"
                  >
                    <option value="">Select Chapter...</option>
                    {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <textarea 
                  required 
                  placeholder="Question text..." 
                  className="w-full p-4 border rounded-xl h-32"
                  value={newQ.text}
                  onChange={e => setNewQ({...newQ, text: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  {newQ.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-lg font-bold">{String.fromCharCode(65+i)}</span>
                      <input 
                        required 
                        placeholder={`Option ${i+1}`} 
                        className="flex-1 p-2 border rounded-lg"
                        value={opt}
                        onChange={e => {
                          const opts = [...newQ.options];
                          opts[i] = e.target.value;
                          setNewQ({...newQ, options: opts});
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-sm font-bold">Correct Option:</label>
                  <select 
                    value={newQ.correctAnswer} 
                    onChange={e => setNewQ({...newQ, correctAnswer: Number(e.target.value)})}
                    className="p-2 border rounded-lg"
                  >
                    {newQ.options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65+i)}</option>)}
                  </select>
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Save to Database</button>
                  <button type="button" onClick={() => setShowAddQuestion(false)} className="px-8 py-3 text-slate-500 font-bold">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questions.map(q => (
              <div key={q.id} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{q.subject}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#ID_{q.id}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 mb-4 line-clamp-3">{q.text}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                   {typeof q.options === 'string' ? JSON.parse(q.options).map((opt: string, i: number) => (
                     <div key={i} className={`text-[10px] p-2 rounded-lg border ${q.correctAnswer == i ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                        {String.fromCharCode(65+i)}. {opt.substring(0, 20)}...
                     </div>
                   )) : q.options.map((opt, i) => (
                    <div key={i} className={`text-[10px] p-2 rounded-lg border ${q.correctAnswer == i ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                       {String.fromCharCode(65+i)}. {opt.substring(0, 20)}...
                    </div>
                  ))}
                </div>
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
                    onClick={() => {
                      const nextMode = !isLive;
                      if (window.confirm(`Switch to ${nextMode ? 'LIVE MYSQL' : 'LOCAL MOCK'} mode? This will reload the application.`)) {
                        MockDB.setLiveMode(nextMode);
                        window.location.reload();
                      }
                    }}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
