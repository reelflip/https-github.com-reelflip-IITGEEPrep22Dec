
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { 
  Users, BookOpen, BarChart2, ShieldCheck, Plus, ListFilter, 
  ClipboardCheck, Database, Zap, Cpu, Search, Trash2, Tag, 
  CheckCircle, Clock, Save, FilePlus, BrainCircuit, Activity, 
  LineChart as LucideLineChart, MousePointer2, X, ShieldAlert, 
  UserPlus, Lock, Unlock, Edit3, Filter
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
  initialTab: 'stats' | 'curriculum' | 'questions' | 'constructor' | 'ai-config' | 'users';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ initialTab }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const stats = MockDB.admin.getSystemStats();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>(MockDB.config.get());
  // Added missing showAddQuestion state to fix reference error in handleAddQuestion (line 122)
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const refreshPanel = () => {
    setQuestions(MockDB.questions.all());
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

  // --- User Management Handlers ---
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
    
    const updates: Partial<User> = {
      name: userForm.name,
      email: userForm.email,
      role: userForm.role
    };
    if (userForm.password) {
      updates.password = userForm.password;
    }
    
    MockDB.admin.updateUser(editingUser.id, updates);
    setShowEditUser(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'student' });
    refreshPanel();
  };

  const handleDeleteUser = (id: string) => {
    if (id === MockDB.auth.user()?.id) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this user? This will remove all their progress and attempts.')) {
      MockDB.admin.deleteUser(id);
      refreshPanel();
    }
  };

  const handleToggleBlock = (user: User) => {
    if (user.id === MockDB.auth.user()?.id) {
      alert("You cannot block yourself.");
      return;
    }
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    MockDB.admin.updateUser(user.id, { status: nextStatus });
    refreshPanel();
  };

  // --- Question/Exam Handlers ---
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    MockDB.questions.add({
      ...qForm,
      chapterId: qForm.chapterId || undefined
    });
    setShowAddQuestion(false);
    setQForm({
      subject: 'Physics',
      chapterId: '',
      examTag: '',
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
    refreshPanel();
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      MockDB.questions.delete(id);
      refreshPanel();
    }
  };

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

  const handleCreateMock = () => {
    if (!mockName || selectedQIds.size === 0) {
      alert("Please provide a name and select at least one question.");
      return;
    }
    const newMock: MasterMockTest = {
      id: `mock_${Date.now()}`,
      name: mockName,
      durationMinutes: mockDuration,
      totalMarks: selectedQIds.size * 4,
      questionIds: Array.from(selectedQIds)
    };
    MockDB.tests.addMasterMock(newMock);
    setMockName('');
    setSelectedQIds(new Set());
    alert("Master Mock Test published!");
  };

  const toggleQSelection = (id: string) => {
    const next = new Set(selectedQIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
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
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{stat.label}</p>
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {initialTab === 'users' && (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              {renderSectionHeader('User Management Console', 'Administrator control over all network participants and their access status.')}
            </div>
            <button 
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4.5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all active:scale-95 mb-10"
            >
              <UserPlus className="w-5 h-5" /> Deploy User
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="Search by name, email or UID..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm"
              />
            </div>
            <div className="bg-white p-5 rounded-full border border-slate-100 shadow-sm text-slate-400">
               <Filter className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-[0.3em]">
                  <tr>
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Access Role</th>
                    <th className="px-10 py-6">Enrollment</th>
                    <th className="px-10 py-6">Current Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className={`transition-colors ${user.status === 'blocked' ? 'bg-rose-50/30 grayscale-[0.5]' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${user.role === 'admin' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{user.name}</p>
                            <p className="text-slate-500 text-[10px] font-mono lowercase tracking-tight">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          user.role === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-slate-400 text-[10px] font-bold uppercase tracking-widest">{new Date(user.joined).toLocaleDateString()}</td>
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${user.status === 'blocked' ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-500'}`}></div>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${user.status === 'blocked' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {user.status || 'active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            title="Edit User Details"
                            className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 hover:border-indigo-100 rounded-2xl transition-all hover:shadow-lg active:scale-90"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleToggleBlock(user)}
                            title={user.status === 'blocked' ? 'Unblock User' : 'Block User'}
                            className={`p-3 rounded-2xl transition-all hover:shadow-lg active:scale-90 ${
                              user.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                            }`}
                          >
                            {user.status === 'blocked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete User"
                            className="p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all hover:shadow-lg active:scale-90"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-32 text-center text-slate-300 italic">
                         No users found matching "{userSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Render curriculum and other tabs from parent AdminPanel as needed... 
          (Note: These should be kept consistent with existing functionality) */}
      {initialTab === 'curriculum' && (
        <div className="space-y-8">
          {renderSectionHeader('Course Builder', 'Architect the core syllabus, study notes, and tutorial inventories.')}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
             <SubjectTracker 
               chapters={MockDB.chapters.all()} 
               updateChapter={(updated) => { MockDB.chapters.update(updated.id, updated); refreshPanel(); }}
               isAdmin={true}
             />
          </div>
        </div>
      )}

      {/* User Management Modals */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight">
                <UserPlus className="text-indigo-400 w-8 h-8" /> User Deployment
              </h3>
              <button onClick={() => setShowAddUser(false)} className="p-4 hover:bg-white/10 rounded-3xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-12 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Display Name</label>
                <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Full Legal Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email Endpoint</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="auth@node.com" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Initial Cipher</label>
                <input required type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Privilege Tier</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner">
                  <option value="student">Student (Aspirant)</option>
                  <option value="admin">Administrator (Root)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all text-sm mt-4">Execute Deployment</button>
            </form>
          </div>
        </div>
      )}

      {showEditUser && editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center border-b border-white/5">
              <h3 className="text-2xl font-black flex items-center gap-4 tracking-tight">
                <Edit3 className="text-indigo-400 w-8 h-8" /> Modify User Record
              </h3>
              <button onClick={() => { setShowEditUser(false); setEditingUser(null); }} className="p-4 hover:bg-white/10 rounded-3xl transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser} className="p-12 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Full Name</label>
                <input required type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Email Endpoint</label>
                <input required type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Update Cipher (Optional)</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" placeholder="Leave empty to keep current" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Privilege Tier</label>
                <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner">
                  <option value="student">Student (Aspirant)</option>
                  <option value="admin">Administrator (Root)</option>
                </select>
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] shadow-2xl shadow-indigo-900/20 hover:bg-indigo-700 transition-all text-sm mt-4">Update Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
