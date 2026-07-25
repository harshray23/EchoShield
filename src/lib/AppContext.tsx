"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const login = (userData: User) => {
    setUser(userData);
    addLog("User logged in", "user");
  };

  const signup = (userData: User) => {
    setUser(userData);
    addLog("User signed up", "user");
  };

  const logout = () => {
    setUser(null);
    addLog("User logged out", "user");
  };

  const addDocument = (name: string, data: any) => {
    const newDoc = { id: Date.now().toString(), name, data, createdAt: new Date() };
    setDocuments([...documents, newDoc]);
    addLog(`Document added: ${name}`, "file-text");
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    addLog("Document deleted", "trash-2");
  };

  const addFile = (file: any) => {
    const newFile = { ...file, id: Date.now().toString(), uploadedAt: new Date() };
    setFiles([...files, newFile]);
    addLog(`File uploaded: ${file.name}`, "hard-drive");
  };

  const addLog = (message: string, iconType: string) => {
    const { User, FileText, HardDrive, Trash2 } = require('lucide-react');
    const icons: Record<string, any> = {
      user: User,
      "file-text": FileText,
      "hard-drive": HardDrive,
      "trash-2": Trash2,
    };
    const newLog = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      Icon: icons[iconType] || FileText
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  const value = {
    user,
    isAuthenticated: !!user,
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
