
import React from 'react';
import { 
  LayoutDashboard, BookOpen, BarChart3, BrainCircuit, 
  GraduationCap, Code2, Database, LogOut, Settings, 
  Users, ClipboardCheck, Tag, Cpu, Activity, LayoutGrid,
  Info, MessageCircleQuestion, Zap, Shield
} from 'lucide-react';
import MockDB from '../services/mockDb';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  role: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, role }) => {
  const studentGroups = [
    {
      label: 'Learning Hub',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'subjects', label: 'Subject Progress', icon: BookOpen },
      ]
    },
    {
      label: 'Evaluation',
      items: [
        { id: 'tests', label: 'Exam Center', icon: BarChart3 },
      ]
    },
    {
      label: 'Logic Assistants',
      items: [
        { id: 'planner', label: 'Study Strategist', icon: BrainCircuit },
        { id: 'mentor', label: 'Private Coach', icon: GraduationCap },
      ]
    }
  ];

  const adminGroups = [
    {
      label: 'Command Center',
      items: [
        { id: 'admin-stats', label: 'Health Dashboard', icon: Activity },
        { id: 'admin-ai', label: 'System Settings', icon: Cpu },
      ]
    },
    {
      label: 'Content Production',
      items: [
        { id: 'admin-curriculum', label: 'Curriculum Builder', icon: LayoutGrid },
        { id: 'admin-questions', label: 'Question Bank', icon: Tag },
        { id: 'admin-tests', label: 'Test Factory', icon: ClipboardCheck },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'admin-users', label: 'User Management', icon: Users },
      ]
    },
    {
      label: 'Architecture',
      items: [
        { id: 'db-viewer', label: 'MySQL Engine', icon: Database },
        { id: 'laravel', label: 'Enterprise PHP Bridge', icon: Code2 },
      ]
    }
  ];

  const currentGroups = role === 'admin' ? adminGroups : studentGroups;

  const handleLogout = () => {
    MockDB.auth.logout();
    onLogout();
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0 shadow-2xl">
      <div className="p-8 border-b border-slate-800 flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40 rotate-3">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-black text-xl text-white leading-none tracking-tight">iitgeeprep</h1>
          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.25em] mt-1.5">
            {role === 'admin' ? 'Cloud Root' : 'Advanced'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
        {currentGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-3">
              {group.label}
            </h3>
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all text-sm group relative ${
                  activeTab === item.id
                    ? 'bg-indigo-600/10 text-white font-bold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.8)]"></div>
                )}
                <item.icon className={`w-4.5 h-4.5 transition-colors ${activeTab === item.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="truncate tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all font-bold border border-transparent hover:border-rose-500/20 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          End Session
        </button>
      </div>

      <div className="p-5 bg-slate-950/60 flex items-center justify-between border-t border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]"></div>
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">v1.5.0 local</span>
        </div>
        <div className="flex gap-1.5">
           <Zap className="w-3 h-3 text-indigo-500 opacity-50" />
           <Shield className="w-3 h-3 text-emerald-500 opacity-50" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
