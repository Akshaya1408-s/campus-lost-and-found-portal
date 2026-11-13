import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEMO_STUDENT_USER, DEMO_ADMIN_USER } from '../data/mockData';
import { AuthService } from '../services/api';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFirebaseUser: boolean;
  authLoading: boolean;
  signInWithGoogle: () => Promise<User>;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: { name: string; email: string; studentId: string; department: string; password?: string }) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: 'student' | 'admin' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Listen to real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          const isAdminEmail = fbUser.email === 'lrsakshaya@gmail.com';

          if (userDoc.exists()) {
            const data = userDoc.data();
            const profile: User = {
              id: fbUser.uid,
              name: data.name || fbUser.displayName || 'Campus User',
              email: fbUser.email || '',
              studentId: data.studentId || `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
              department: data.department || 'Undergraduate Studies',
              role: isAdminEmail ? 'admin' : (data.role || 'student'),
              phone: data.phone,
            };
            setUser(profile);
            localStorage.setItem('campus_auth_user', JSON.stringify(profile));
          } else {
            // First-time sign-in auto bootstrap in Firestore
            const profile: User = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Campus User',
              email: fbUser.email || '',
              studentId: `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
              department: 'Undergraduate Studies',
              role: isAdminEmail ? 'admin' : 'student',
              phone: fbUser.phoneNumber || undefined,
            };
            try {
              await setDoc(userDocRef, {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                studentId: profile.studentId,
                department: profile.department,
                role: profile.role,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (err) {
              console.warn('Could not auto-create user profile in Firestore:', err);
            }
            setUser(profile);
            localStorage.setItem('campus_auth_user', JSON.stringify(profile));
          }
        } catch (e) {
          console.warn('Error reading user document:', e);
          const isAdminEmail = fbUser.email === 'lrsakshaya@gmail.com';
          const fallbackProfile: User = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Campus User',
            email: fbUser.email || '',
            studentId: `STU-${fbUser.uid.slice(0, 5).toUpperCase()}`,
            department: 'Undergraduate Studies',
            role: isAdminEmail ? 'admin' : 'student',
          };
          setUser(fallbackProfile);
        }
      } else {
        // No active Firebase Auth user
        setUser(null);
        localStorage.removeItem('campus_auth_user');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const loggedInUser = await AuthService.signInWithGoogle();
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setAuthLoading(true);
    try {
      const loggedInUser = await AuthService.login(email, pass);
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; studentId: string; department: string; password?: string }) => {
    setAuthLoading(true);
    try {
      const newUser = await AuthService.register(data);
      setUser(newUser);
      return newUser;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('campus_auth_user');
  };

  const switchRole = (role: 'student' | 'admin' | 'guest') => {
    if (role === 'student') {
      setUser(DEMO_STUDENT_USER);
    } else if (role === 'admin') {
      setUser(DEMO_ADMIN_USER);
    } else {
      setUser(null);
      localStorage.removeItem('campus_auth_user');
    }
  };

  const isRealFirebaseUser = !!auth.currentUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isFirebaseUser: isRealFirebaseUser,
        isAdmin: (user?.role === 'admin' || auth.currentUser?.email === 'lrsakshaya@gmail.com') && !!user,
        authLoading,
        signInWithGoogle,
        login,
        register,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
