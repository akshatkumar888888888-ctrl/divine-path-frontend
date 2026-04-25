import React, { useState } from 'react';
import { Lock, User, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { UserRole } from '../types';

interface LoginPageProps {
  onLogin: (id: string, role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<UserRole>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, role: loginType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('token', data.token);
      onLogin(data.user.id, data.user.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE8CC 50%, #FFF3E0 100%)' }}>

      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,101,26,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,101,26,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', marginBottom: 16, background: 'transparent' }}>
            <img src="/logo.png" alt="Divine Path Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ color: '#D4651A', fontSize: 26, fontWeight: 800, letterSpacing: 2, fontFamily: 'sans-serif' }}>DIVINE PATH</h1>
          <p style={{ color: '#8B4513', fontSize: 12, letterSpacing: 1, marginTop: 4, fontFamily: 'sans-serif' }}>A better learning future starts here</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 40px rgba(212,101,26,0.15)', border: '1px solid rgba(212,101,26,0.15)', overflow: 'hidden' }}>
          <div style={{ background: '#FFF3E0', padding: '8px', display: 'flex', gap: 4 }}>
            <button onClick={() => setLoginType('user')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: loginType === 'user' ? 'white' : 'transparent', color: loginType === 'user' ? '#D4651A' : '#8B4513', boxShadow: loginType === 'user' ? '0 2px 8px rgba(212,101,26,0.15)' : 'none' }}>
              Student Login
            </button>
            <button onClick={() => setLoginType('admin')}
              style={{ flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: loginType === 'admin' ? 'white' : 'transparent', color: loginType === 'admin' ? '#D4651A' : '#8B4513', boxShadow: loginType === 'admin' ? '0 2px 8px rgba(212,101,26,0.15)' : 'none' }}>
              Admin Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFD0D0', color: '#CC3333', padding: '10px 14px', borderRadius: 12, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={14} />{error}
              </div>
            )}

            <div style={{ marginBottom: 14, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4651A' }}>
                <User size={18} />
              </div>
              <input type="text" required value={id} onChange={(e) => setId(e.target.value)}
                placeholder={loginType === 'admin' ? 'Admin ID' : 'Student ID'}
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: '1.5px solid #FFD9B0', background: '#FFFAF5', fontSize: 14, outline: 'none', color: '#1a0a00', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: 20, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#D4651A' }}>
                <Lock size={18} />
              </div>
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
                style={{ width: '100%', padding: '12px 42px 12px 42px', borderRadius: 12, border: '1.5px solid #FFD9B0', background: '#FFFAF5', fontSize: 14, outline: 'none', color: '#1a0a00', boxSizing: 'border-box' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#D4651A' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={isLoading}
              style={{ width: '100%', padding: '13px', background: isLoading ? '#E8A87C' : 'linear-gradient(135deg, #D4651A, #B5430A)', color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 15px rgba(212,101,26,0.4)', transition: 'all 0.2s' }}>
              {isLoading ? <><Loader2 size={16} className="animate-spin" />Authenticating...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#8B4513', fontSize: 11, marginTop: 24, opacity: 0.6 }}>
          © 2026 Divine Path. All rights reserved.
        </p>
      </div>
    </div>
  );
}