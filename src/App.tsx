import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import { AnimatePresence, motion } from 'motion/react';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User, UserRole } from './types';

function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('divinePathUser');
    const token = localStorage.getItem('token');
    if (savedUser && token && isTokenValid(token)) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('divinePathUser');
      localStorage.removeItem('token');
    }
  }, []);

  const handleLogin = (id: string, role: UserRole, name?: string) => {
    const loggedUser: User = {
      id,
      role,
      name: name || (role === 'admin' ? 'System Administrator' : id),
    };
    setUser(loggedUser);
    setIsLoggedIn(true);
    localStorage.setItem('divinePathUser', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('divinePathUser');
    localStorage.removeItem('token');
  };

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : user?.role === 'admin' ? (
          <motion.div
            key="admin-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          >
            <AdminDashboard user={user} onLogout={handleLogout} />
          </motion.div>
        ) : user ? (
          <motion.div
            key="user-dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <UserDashboard user={user} onLogout={handleLogout} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}