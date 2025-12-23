
import React, { useState, useEffect } from 'react';
import MockDB from '../services/mockDb';
import { Database, Table, ExternalLink, Users, ClipboardList, ShieldCheck, Activity, Loader2 } from 'lucide-react';

interface DbViewerProps {
  onNavigate: (tab: string) => void;
}

const DbViewer: React.FC<DbViewerProps> = ({ onNavigate }) => {
  const [activeTable, setActiveTable] = useState<'chapters' | 'mock_tests' | 'users' | 'logs'>('chapters');
  
  // Fix: Handle async MockDB calls using state and useEffect
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTableData = async () => {
      setLoading(true);
      try {
        let result: any[] = [];
        switch (activeTable) {
          case 'chapters':
            result = await MockDB.chapters.all();
            break;
          case 'mock_tests':
            result = await MockDB.tests.all();
            break;
          case 'users':
            result = await MockDB.admin.getAllUsers();
            break;
          case 'logs':
            result = MockDB.admin.getLogs();
            break;
        }
        setTableData(result);
      } finally {
        setLoading(false);
      }
    };
    fetchTableData();
  }, [activeTable]);
  
  const renderTable = () => {
    if (loading) return (
      <div className="p-20 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest">Awaiting Engine Response...</span>
      </div>
    );

    switch (activeTable) {
      case 'chapters':
        return (
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 border-b border-slate-200">id</th>
                <th className="px-6 py-3 border-b border-slate-200">name</th>
                <th className="px-6 py-3 border-b border-slate-200">status</th>
                <th className="px-6 py-3 border-b border-slate-200">confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-indigo-600 font-bold">{row.id}</td>
                  <td className="px-6 py-3 text-slate-800">{row.name}</td>
                  <td className="px-6 py-3"><span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">{row.status}</span></td>
                  <td className="px-6 py-3 text-slate-500">{row.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'logs':
        return (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3 border-b">timestamp</th>
                <th className="px-6 py-3 border-b">user</th>
                <th className="px-6 py-3 border-b">action</th>
                <th className="px-6 py-3 border-b">level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-400">{new Date(row.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-3 font-bold text-slate-600">{row.userName}</td>
                  <td className="px-6 py-3 text-slate-800">{row.action}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      row.level === 'error' ? 'bg-rose-100 text-rose-600' : 
                      row.level === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {row.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'mock_tests':
        return (
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 border-b">test_name</th>
                <th className="px-6 py-3 border-b text-center">total</th>
                <th className="px-6 py-3 border-b">date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-800 font-bold">{row.name}</td>
                  <td className="px-6 py-3 text-center text-indigo-600 font-black">{row.totalScore}</td>
                  <td className="px-6 py-3 text-slate-400">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'users':
        return (
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-3 border-b">name</th>
                <th className="px-6 py-3 border-b">email</th>
                <th className="px-6 py-3 border-b">role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-800">{row.name}</td>
                  <td className="px-6 py-3 text-slate-500">{row.email}</td>
                  <td className="px-6 py-3 uppercase text-[10px] font-bold">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Database className="text-indigo-600 w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-mono">MySQL Engine Simulation</h2>
            <p className="text-xs text-slate-500 font-mono">InnoDB Engine • Cluster Active</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'chapters', label: 'chapters', icon: Table },
          { id: 'mock_tests', label: 'mock_tests', icon: ClipboardList },
          { id: 'users', label: 'users', icon: Users },
          { id: 'logs', label: 'system_logs', icon: Activity },
        ].map(table => (
          <button
            key={table.id}
            onClick={() => setActiveTable(table.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeTable === table.id 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <table.icon className="w-3.5 h-3.5" />
            SELECT * FROM {table.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          {renderTable()}
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl p-6 text-indigo-300 font-mono text-xs overflow-hidden relative">
         <div className="absolute top-4 right-4 text-slate-700">
            <ShieldCheck className="w-12 h-12" />
         </div>
         <p className="text-indigo-400 font-bold mb-2">// RELATIONAL INTEGRITY VERIFIED</p>
         <p>MockDB handles all IO as atomic operations.</p>
         <p>Encryption: BCrypt (Simulated) for all User credentials.</p>
         <p className="mt-4 text-slate-500 italic">-- Prepared Statement: EXECUTE sync_student_progress</p>
      </div>
    </div>
  );
};

export default DbViewer;
