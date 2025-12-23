
import React, { useState } from 'react';
import MockDB from '../services/mockDb';
import { GraduationCap, Loader2, AlertCircle, User as UserIcon, Shield, Key, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
}

type AuthMode = 'login' | 'register' | 'recover';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    recoveryHint: ''
  });

  const handleSubmit = async (e: React.FormEvent, credentials?: { email: string, pass: string }) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const email = credentials ? credentials.email : formData.email;
    const pass = credentials ? credentials.pass : formData.password;

    setTimeout(() => {
      if (mode === 'login' || credentials) {
        const result = MockDB.auth.login(email, pass);
        if (typeof result === 'string') {
          setError(result);
          setLoading(false);
        } else {
          onLogin();
        }
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (!formData.recoveryHint) {
          setError("Recovery key is required for security.");
          setLoading(false);
          return;
        }
        const result = MockDB.auth.register(formData.name, formData.email, formData.password, formData.recoveryHint);
        if (typeof result === 'string') {
          setError(result);
          setLoading(false);
        } else {
          onLogin();
        }
      } else if (mode === 'recover') {
        const result = MockDB.auth.recover(formData.email, formData.recoveryHint, formData.password);
        if (result === "SUCCESS") {
          setSuccess("Password reset successful! You can now login.");
          setMode('login');
          setLoading(false);
        } else {
          setError(result);
          setLoading(false);
        }
      }
    }, 600);
  };

  const handleDemoLogin = (role: 'student' | 'admin') => {
    setMode('login');
    if (role === 'student') {
      handleSubmit(null as any, { email: 'student@demo.com', pass: 'password' });
    } else {
      handleSubmit(null as any, { email: 'admin@mastery.com', pass: 'admin' });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
        {mode !== 'recover' && (
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'login' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all ${mode === 'register' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>
        )}

        {mode === 'recover' && (
          <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Password Recovery</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-10 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 text-emerald-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 font-bold text-xs">@</div>
              <input 
                required
                type="email"
                placeholder="aspirant@iit.edu"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {(mode === 'login' || mode === 'register' || mode === 'recover') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {mode === 'recover' ? 'New Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-2xl focus:ring-2 outline-none transition-all text-sm ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-rose-300 focus:ring-rose-500' 
                    : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'recover') && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {mode === 'recover' ? 'Recovery Key' : 'Recovery Key (Keep it safe)'}
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="text"
                  placeholder="Secret phrase for resets"
                  value={formData.recoveryHint}
                  onChange={e => setFormData({...formData, recoveryHint: e.target.value})}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-bold shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Reset Password'
            )}
          </button>

          {mode === 'login' && (
            <div className="text-center mt-2">
              <button 
                type="button"
                onClick={() => { setMode('recover'); setError(''); setSuccess(''); }}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {mode === 'recover' && (
            <div className="text-center mt-2">
              <button 
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}
        </form>

        <div className="px-10 pb-10 pt-4 bg-slate-50/50">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest font-black text-slate-400">
              <span className="bg-white px-4 rounded-full border border-slate-100">Try Demo Access</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white text-slate-700 rounded-xl text-[10px] font-black uppercase border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 bg-white text-slate-700 rounded-xl text-[10px] font-black uppercase border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
