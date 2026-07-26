"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useUser } from '@/firebase';

type User = {
  name?: string;
  email: string;
};

type AppContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  signup: (user: User) => void;
  logout: () => void;
  documents: any[];
  addDocument: (name: string, data: any) => void;
  deleteDocument: (id: string) => void;
  files: any[];
  addFile: (file: any) => void;
  logs: any[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, loading: authLoading } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Robust Sync with Firebase User
  useEffect(() => {
    if (firebaseUser) {
      setUser({
        name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest Agent' : 'Agent'),
        email: firebaseUser.email || 'guest@echoshield.ai'
      });
    } else if (!authLoading) {
      setUser(null);
    }
  }, [firebaseUser, authLoading]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const signup = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const addDocument = (name: string, data: any) => {
    const newDoc = { id: Date.now().toString(), name, data, createdAt: new Date() };
    setDocuments([...documents, newDoc]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  const addFile = (file: any) => {
    const newFile = { ...file, id: Date.now().toString(), uploadedAt: new Date() };
    setFiles([...files, newFile]);
  };

  const value = {
    user,
    isAuthenticated: !!user || !!firebaseUser,
    login,
    signup,
    logout,
    documents,
    addDocument,
    deleteDocument,
    files,
    addFile,
    logs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
