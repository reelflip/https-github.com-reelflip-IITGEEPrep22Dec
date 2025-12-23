
import React from 'react';
import { LayoutDashboard, BookOpen, BarChart3, BrainCircuit, GraduationCap, Code2, Database, LogOut, Settings } from 'lucide-react';
import MockDB from '../services/mockDb';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  role: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, role }) => {
  const studentItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tests', label: 'Mock Tests', icon: BarChart3 },
    { id: 'planner', label: 'AI Planner', icon: BrainCircuit },
    { id: 'mentor', label: 'AI Mentor', icon: GraduationCap },
  ];

  const adminItems = [
    { id: 'admin-panel', label: 'Admin Dashboard', icon: Settings },
    { id: 'db-viewer', label: 'Raw MySQL Viewer', icon: Database },
    { id: 'laravel', label: 'PHP Laravel Code', icon: Code2 },
  ];

  const handleLogout = () => {
    MockDB.auth.logout();
    onLogout();
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-none tracking-tight">iitgeeprep</h1>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
            {role === 'admin' ? 'Laravel Stack' : 'Student Portal'}
          </p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2 mt-2">
          {role === 'admin' ? 'Administration' : 'Learning Management'}
        </div>
        
        {(role === 'admin' ? adminItems : studentItems).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      {role === 'admin' && (
        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">DB Connection</span>
          </div>
          <p className="text-xs text-slate-500 font-mono">localhost:3306</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
