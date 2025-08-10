"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { LogIn, UserPlus, FileUp, FileText, Trash2, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type User = {
  name: string;
  email: string;
};

type Document = {
  id: string;
  name: string;
  data: Record<string, any>;
  createdAt: Date;
};

type StoredFile = {
  id: string;
  name:string;
  size: number;
  type: string;
  uploadedAt: Date;
};

type ActivityLog = {
  id: string;
  message: string;
  timestamp: Date;
  Icon: LucideIcon;
};

type AppContextType = {
  user: User | null;
  isAuthenticated: boolean;
  documents: Document[];
  files: StoredFile[];
  logs: ActivityLog[];
  login: (data: Pick<User, 'email'>) => void;
  signup: (data: User) => void;
  logout: () => void;
  addDocument: (name: string, data: Record<string, any>) => void;
  deleteDocument: (id: string) => void;
  addFile: (file: Omit<StoredFile, 'id' | 'uploadedAt'>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialDocs: Document[] = [
    { id: 'user_1', name: 'users/alovelace', data: { first: 'Ada', last: 'Lovelace', born: 1815 }, createdAt: new Date() },
    { id: 'user_2', name: 'users/aturing', data: { first: 'Alan', last: 'Turing', born: 1912 }, createdAt: new Date() },
];

const initialFiles: StoredFile[] = [
    { id: 'file_1', name: 'project-plan.pdf', size: 1024 * 1024 * 2.3, type: 'application/pdf', uploadedAt: new Date() },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<Document[]>(initialDocs);
  const [files, setFiles] = useState<StoredFile[]>(initialFiles);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const { toast } = useToast();

  const addLog = useCallback((message: string, Icon: LucideIcon) => {
    setLogs(prev => [{ id: new Date().toISOString(), message, timestamp: new Date(), Icon }, ...prev].slice(0, 10));
  }, []);

  const login = (data: Pick<User, 'email'>) => {
    const userData = { email: data.email, name: data.email.split('@')[0] };
    setUser(userData);
    addLog(`User ${userData.email} logged in.`, LogIn);
    toast({ title: "Login Successful", description: `Welcome back, ${userData.name}!` });
  };
  
  const signup = (data: User) => {
    setUser(data);
    addLog(`New user ${data.email} signed up.`, UserPlus);
    toast({ title: "Signup Successful", description: `Welcome, ${data.name}!` });
  };

  const logout = () => {
    if (user) {
        addLog(`User ${user.email} logged out.`, LogIn);
    }
    setUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  const addDocument = (name: string, data: Record<string, any>) => {
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      name,
      data,
      createdAt: new Date(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    addLog(`Document '${name}' created.`, FileText);
    toast({ title: "Document Added", description: `Successfully created ${name}.` });
  };

  const deleteDocument = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    if(docToDelete) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        addLog(`Document '${docToDelete.name}' deleted.`, Trash2);
        toast({ title: "Document Deleted", description: `Successfully deleted ${docToDelete.name}.`, variant: "destructive" });
    }
  };

  const addFile = (file: Omit<StoredFile, 'id' | 'uploadedAt'>) => {
    const newFile: StoredFile = {
      ...file,
      id: `file_${Date.now()}`,
      uploadedAt: new Date(),
    };
    setFiles(prev => [newFile, ...prev]);
    addLog(`File '${file.name}' uploaded.`, FileUp);
    toast({ title: "File Uploaded", description: `${file.name} is now in your storage.` });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    documents,
    files,
    logs,
    login,
    signup,
    logout,
    addDocument,
    deleteDocument,
    addFile,
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
