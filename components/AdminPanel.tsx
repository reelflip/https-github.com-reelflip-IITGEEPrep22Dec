
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { 
  Users, BookOpen, BarChart2, ShieldCheck, Plus, ListFilter, 
  ClipboardCheck, Database, Zap, Cpu, Search, Trash2, Tag, 
  CheckCircle, Clock, Save, FilePlus, BrainCircuit, Activity, 
  LineChart as LucideLineChart, MousePointer2, X, ShieldAlert, 
  UserPlus, Lock, Unlock, Edit3, Filter, Rocket, AlertTriangle
} from 'lucide-react';
import { Subject, ChapterStatus, Question, MasterMockTest, AIModelConfig, User, UserRole } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import SubjectTracker from './SubjectTracker';

const AI_MODELS: AIModelConfig[] = [
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', tag: 'SPEED (FREE)', description: 'Ultra-fast, optimized for quick doubts and scheduling.', type: 'speed', internalId: 'gemini-3-flash-preview' },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', tag: 'REASONING', description: 'Deep reasoning and complex Physics problem solving.', type: 'reasoning', internalId: 'gemini-3-pro-preview' },
  { id: 'llama-3-1', name: 'Llama 3.1 (70B)', tag: 'GENERAL', description: 'Versatile model with great theory explanation capabilities.', type: 'general', internalId: 'gemini-3-flash-preview' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', tag: 'LOGIC', description: 'Logic-heavy model, excellent for Inorganic Chemistry facts.', type: 'logic', internalId: 'gemini-3-pro-preview' },
  { id: 'qwen-math', name: 'Qwen 2.5 Math', tag: 'MATH', description: 'Specialized for high-level Mathematics and Calculus.', type: 'math', internalId: 'gemini-3-pro-preview' },
  { id: 'mistral-large', name: 'Mistral Large', tag: 'BALANCED', description: 'Balanced performance for general guidance and motivation.', type: 'balanced', internalId: 'gemini-3-pro-preview' },
];

interface AdminPanelProps {
  initialTab: 'stats' | 'curriculum' | 'questions' | 'admin-tests' | 'ai-config' | 'users';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const stats = MockDB.admin.getSystemStats();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [masterMocks, setMasterMocks] = useState<MasterMockTest[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(MockDB.config.get());
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const refreshPanel = () => {
    setQuestions(MockDB.questions.all());
    setMasterMocks(MockDB.tests.getMasterMocks());
    setChapters(MockDB.chapters.all());
    setSystemConfig(MockDB.config.get());
    setAllUsers(MockDB.admin.getAllUsers());
  };

  useEffect(() => {
    refreshPanel();
  }, [initialTab]);

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

  // --- Handlers ---
  const handleModelChange = (id: string) => {
    MockDB.config.set({ activeModelId: id });
    refreshPanel();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    MockDB.admin.addUser({ ...userForm, recoveryHint: 'admin_manual_add' });
    setShowAddUser(false);
    setUserForm({ name: '', email: '', password: '', role: 'student' });
    refreshPanel();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role });
    setShowEditUser(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updates: Partial<User> = { name: userForm.name, email: userForm.email, role: userForm.role };
    if (userForm.password) updates.password = userForm.password;
    MockDB.admin.updateUser(editingUser.id, updates);
    setShowEditUser(false);
    setEditingUser(null);
    refreshPanel();
  };

  const handleDeleteUser = (id: string) => {
    if (id === MockDB.auth.user()?.id) return alert("You cannot delete your own account.");
    if (window.confirm('Delete this user and all progress?')) {
      MockDB.admin.deleteUser(id);
      refreshPanel();
    }
  };

  const handleToggleBlock = (user: User) => {
    if (user.id === MockDB.auth.user()?.id) return alert("You cannot block yourself.");
    MockDB.admin.updateUser(user.id, { status: user.status === 'blocked' ? 'active' : 'blocked' });
    refreshPanel();
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    MockDB.questions.add({ ...qForm, chapterId: qForm.chapterId || undefined });
    setShowAddQuestion(false);
    setQForm({ subject: 'Physics', chapterId: '', examTag: '', text: '', options: ['', '', '', ''], correctAnswer: 0 });
    refreshPanel();
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Delete this question?')) {
      MockDB.questions.delete(id);
      refreshPanel();
    }
  };

  const handleCreateMock = () => {
    if (!mockName || selectedQIds.size === 0) return alert("Missing name or questions.");
    MockDB.tests.addMasterMock({
      id: `mock_${Date.now()}`,
      name: mockName,
      durationMinutes: mockDuration,
      totalMarks: selectedQIds.size * 4,
      questionIds: Array.from(selectedQIds)
    });
    setMockName('');
    setSelectedQIds(new Set());
    refreshPanel();
    alert("Master Test published to student portals!");
  };

  const handleDeleteMasterMock = (id: string) => {
    if (window.confirm('Are you sure you want to decommission this test? It will disappear from all student accounts.')) {
      MockDB.tests.deleteMasterMock(id);
      refreshPanel();
    }
  };

  const toggleQSelection = (id: string) => {
    const next = new Set(selectedQIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedQIds(next);
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'speed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'reasoning': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'general': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'logic': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'math': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'balanced': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const renderSectionHeader = (title: string, subtitle: string) => (
    <div className="mb-10">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">{title}</h2>
      <p className="text-slate-500 text-base font-medium opacity-80">{subtitle}</p>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      {initialTab === 'stats' && (
        <div className="space-y-10">
          {renderSectionHeader('System Health Monitor', 'Aggregated telemetry from across the iitgeeprep network.')}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Network Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'Question Bank', value: stats.totalQuestions, icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { label: 'Mock Attempts', value: stats.totalTestsTaken, icon: BarChart2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { label: 'MySQL Index Size', value: stats.dbSize, icon: Database, color: 'text-rose-600', bg: 'bg-rose-100' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-[2rem] shadow-sm border border-slate-100 bg-white hover:shadow-xl transition-all">
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
        <div className="space-y-8">
          {renderSectionHeader('Intelligence Orchestration', 'Assign specialized LLMs to various cognitive tasks within the student portal.')}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-indigo-600" /> Select Engine Node</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {AI_MODELS.map((model) => (
                  <button key={model.id} onClick={() => handleModelChange(model.id)} className={`p-7 rounded-[2.5rem] border-2 text-left transition-all hover:shadow-xl group ${systemConfig.activeModelId === model.id ? 'border-indigo-500 bg-indigo-50/40 ring-4 ring-indigo-50' : 'border-slate-100 bg-white'}`}>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black tracking-[0.2em] border mb-4 ${getTagColor(model.type)}`}>{model.tag}</div>
                    <h4 className="font-black text-slate-900 text-xl mb-2 leading-none group-hover:text-indigo-600 transition-colors">{model.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium mt-3">{model.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-[10px] flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-600" /> Inference Telemetry</h3>
              <div className="glass-card p-10 rounded-[2.5rem] border border-slate-100 bg-white h-full flex flex-col shadow-sm">
                <div className="flex justify-between items-center mb-12">
                  <div><p className="text-4xl font-black text-slate-900 tracking-tighter">92.4%</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence Score</p></div>
                  <div className="text-right"><p className="text-4xl font-black text-emerald-600 tracking-tighter">0.8s</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inference Burst</p></div>
                </div>
                <div className="flex-1 h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={systemConfig.modelMetrics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis domain={[80, 100]} hide />
                        <Area type="monotone" dataKey="accuracy" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.1} />
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
          {renderSectionHeader('Course Builder', 'Architect the core syllabus, study notes, and tutorial inventories.')}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <SubjectTracker chapters={MockDB.chapters.all()} updateChapter={(updated) => { MockDB.chapters.update(updated.id, updated); refreshPanel(); }} isAdmin={true} />
          </div>
        </div>
      )}

      {initialTab === 'questions' && (
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div>{renderSectionHeader('Academic Resource Pool', 'The centralized repository of JEE-standard examination material.')}</div>
            <button onClick={() => setShowAddQuestion(true)} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95 mb-10"><Plus className="w-5 h-5" /> Import Entry</button>
          </div>
          <div className="glass-card rounded-[3rem] border border-slate-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.25em]">
                  <tr><th className="px-10 py-6">Domain</th><th className="px-10 py-6">Content Spec</th><th className="px-10 py-6 text-right">Ops</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-7">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${q.subject === 'Physics' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{q.subject}</span>
                      </td>
                      <td className="px-10 py-7 max-w-lg"><p className="text-slate-800 text-sm font-bold line-clamp-2">{q.text}</p></td>
                      <td className="px-10 py-7 text-right"><button onClick={() => handleDeleteQuestion(q.id)} className="p-3.5 text-slate-300 hover:text-rose-600 transition-colors bg-white border border-slate-100 rounded-2xl hover:shadow-lg"><Trash2 className="w-4.5 h-4.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {initialTab === 'admin-tests' && (
        <div className="space-y-12">
          {renderSectionHeader('Test Factory', 'Architect and deploy Computer Based Tests to the entire student network.')}
          
          {/* Section: Deployed Test Registry (The Fix) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-4">
              <Rocket className="w-5 h-5 text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Deployed Test Registry</h3>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 ml-auto">{masterMocks.length} Active Mocks</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {masterMocks.length > 0 ? masterMocks.map(mock => (
                <div key={mock.id} className="glass-card p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                         {mock.name.charAt(0)}
                      </div>
                      <button 
                        onClick={() => handleDeleteMasterMock(mock.id)}
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   <h4 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{mock.name}</h4>
                   <div className="flex flex-wrap gap-3 mt-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <Clock className="w-3.5 h-3.5" /> {mock.durationMinutes}m
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <Tag className="w-3.5 h-3.5" /> {mock.questionIds.length} Units
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                        {mock.totalMarks} Marks
                      </span>
                   </div>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 -mr-12 -mt-12 rounded-full" />
                </div>
              )) : (
                <div className="lg:col-span-3 py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center">
                   <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry Empty. Deploy a new test below.</p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Test Assembly Line */}
          <section className="space-y-6 pt-10 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 mb-4">
              <FilePlus className="w-5 h-5 text-indigo-600" />
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">New Test Assembly Line</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1">
                <div className="glass-card p-10 rounded-[3rem] border border-slate-100 bg-white shadow-2xl sticky top-24">
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-[11px] mb-10 flex items-center gap-3"> Deployment Protocol</h3>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mock Namespace</label>
                      <input type="text" value={mockName} onChange={e => setMockName(e.target.value)} placeholder="e.g. AITS Phase II" className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Time Budget (Minutes)</label>
                      <input type="number" value={mockDuration} onChange={e => setMockDuration(parseInt(e.target.value))} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm shadow-inner" />
                    </div>

                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Payload Size</span>
                          <span className="text-xs font-black text-indigo-400">{selectedQIds.size} Units</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min(100, (selectedQIds.size / 30) * 100)}%` }} />
                       </div>
                    </div>

                    <button 
                      onClick={handleCreateMock} 
                      className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-700 transition-all text-xs active:scale-95 flex items-center justify-center gap-3"
                    >
                      <CheckCircle className="w-5 h-5" /> Deploy to Network
                    </button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-4">Available Unit Selection</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{questions.length} Pool Units</span>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[75vh] overflow-y-auto pr-6 custom-scrollbar">
                  {questions.map((q) => (
                    <button key={q.id} onClick={() => toggleQSelection(q.id)} className={`w-full text-left p-8 rounded-[2.5rem] border-2 transition-all flex items-start gap-6 group ${selectedQIds.has(q.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-white bg-white hover:border-slate-200 shadow-sm'}`}>
                      <div className={`mt-1.5 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-colors shrink-0 ${selectedQIds.has(q.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'}`}>
                        {selectedQIds.has(q.id) && <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{q.subject}</span>
                           <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                           <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">{chapters.find(c => c.id === q.chapterId)?.name || 'General Inventory'}</span>
                        </div>
                        <p className="text-base text-slate-800 font-bold leading-relaxed">{q.text}</p>
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
            <div>{renderSectionHeader('User Management Console', 'Administrator control over all network participants.')}</div>
            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 active:scale-95 mb-10"><UserPlus className="w-5 h-5" /> Deploy User</button>
          </div>
          <div className="glass-card rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
                  <tr><th className="px-10 py-6">Identity</th><th className="px-10 py-6">Role</th><th className="px-10 py-6">Status</th><th className="px-10 py-6 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors ${user.status === 'blocked' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${user.role === 'admin' ? 'bg-amber-600' : 'bg-indigo-600'}`}>{user.name.charAt(0)}</div>
                          <div><p className="font-black text-slate-900">{user.name}</p><p className="text-slate-500 text-[10px] lowercase">{user.email}</p></div>
                        </div>
                      </td>
                      <td className="px-10 py-7"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${user.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>{user.role}</span></td>
                      <td className="px-10 py-7"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${user.status === 'blocked' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div><span className="text-[9px] font-black uppercase">{user.status || 'active'}</span></div></td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditUser(user)} className="p-3 border border-slate-100 text-slate-300 hover:text-indigo-600 rounded-2xl"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleBlock(user)} className={`p-3 rounded-2xl ${user.status === 'blocked' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{user.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-3 border border-slate-100 text-slate-300 hover:text-rose-600 rounded-2xl"><Trash2 className="w-4 h-4" /></button>
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

      {/* Modals */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center"><h3 className="text-2xl font-black flex items-center gap-4 tracking-tight"><FilePlus className="text-indigo-400 w-8 h-8" /> Entry Protocol</h3><button onClick={() => setShowAddQuestion(false)} className="p-4 hover:bg-white/10 rounded-3xl transition-all"><X className="w-8 h-8" /></button></div>
            <form onSubmit={handleAddQuestion} className="p-12 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <select value={qForm.subject} onChange={e => setQForm({...qForm, subject: e.target.value as Subject})} className="px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"><option>Physics</option><option>Chemistry</option><option>Mathematics</option></select>
                <input type="text" value={qForm.examTag} onChange={e => setQForm({...qForm, examTag: e.target.value})} placeholder="e.g. JEE-MAIN-2024" className="px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs" />
              </div>
              <textarea required rows={5} value={qForm.text} onChange={e => setQForm({...qForm, text: e.target.value})} className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] font-bold" placeholder="Question statement..." />
              {qForm.options.map((opt, i) => (
                <div key={i} className="flex gap-5">
                  <input required type="text" value={opt} onChange={e => { const newOpts = [...qForm.options]; newOpts[i] = e.target.value; setQForm({...qForm, options: newOpts}); }} className="flex-1 px-8 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm" placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                  <button type="button" onClick={() => setQForm({...qForm, correctAnswer: i})} className={`px-8 py-5 rounded-2xl font-black text-[10px] ${qForm.correctAnswer === i ? 'bg-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>Correct</button>
                </div>
              ))}
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-700 transition-all text-sm">Commit to Bank</button>
            </form>
          </div>
        </div>
      )}

      {showAddUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center"><h3 className="text-2xl font-black flex items-center gap-4 tracking-tight"><UserPlus className="text-indigo-400 w-8 h-8" /> User Deployment</h3><button onClick={() => setShowAddUser(false)} className="p-4 hover:bg-white/10 rounded-3xl transition-all"><X className="w-8 h-8" /></button></div>
            <form onSubmit={handleAddUser} className="p-12 space-y-6">
              <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Display Name" />
              <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Email" />
              <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Password" />
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"><option value="student">Student</option><option value="admin">Admin</option></select>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl mt-4">Execute Deployment</button>
            </form>
          </div>
        </div>
      )}

      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center"><h3 className="text-2xl font-black flex items-center gap-4 tracking-tight"><Edit3 className="text-indigo-400 w-8 h-8" /> Modify Record</h3><button onClick={() => { setShowEditUser(false); setEditingUser(null); }} className="p-4 hover:bg-white/10 rounded-3xl transition-all"><X className="w-8 h-8" /></button></div>
            <form onSubmit={handleSaveEditUser} className="p-12 space-y-6">
              <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Name" />
              <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="Email" />
              <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="New Password (Optional)" />
              <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest"><option value="student">Student</option><option value="admin">Admin</option></select>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl mt-4">Update Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
